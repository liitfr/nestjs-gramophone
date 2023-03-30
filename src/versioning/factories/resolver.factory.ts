import { Inject, Type } from '@nestjs/common';
import { Types as MongooseTypes } from 'mongoose';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { MongoObjectIdScalar } from '../../utils/scalars/mongo-id.scalar';
import { getEntityName } from '../../utils/entity-enhancers/enhancers.util';

import { VersioningService } from '../services/versioning.service';

export function resolverFactory(
  EntityVersion: Type<unknown>,
  providerName: string,
) {
  const entityVersionNameValue = getEntityName(EntityVersion);

  @Resolver(() => EntityVersion)
  class EntityVersionResolver {
    constructor(
      @Inject(providerName)
      readonly versioningService: VersioningService<unknown>,
    ) {}

    @Query(() => [EntityVersion], {
      name: `findAll${entityVersionNameValue}sForOneOriginalId`,
    })
    public async findAllVersionsForOneOriginalId(
      @Args('originalId', { type: () => MongoObjectIdScalar })
      originalId: MongooseTypes.ObjectId,
    ) {
      return this.versioningService.findAllVersionsForOneOriginalId(originalId);
    }

    @Query(() => EntityVersion, {
      name: `findOne${entityVersionNameValue}ById`,
    })
    public async findOneById(
      @Args('id', { type: () => MongoObjectIdScalar })
      id: MongooseTypes.ObjectId,
    ) {
      return this.versioningService.findOneById(id);
    }
  }

  return EntityVersionResolver;
}
