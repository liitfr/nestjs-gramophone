import { Inject, Type } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { IdScalar } from '../../utils/scalars/id.scalar';
import { Id } from '../../utils/id.type';
import { EntityStore } from '../../utils/entities/entity-store.service';

import { VersioningService } from '../services/versioning.service';

export function VersioningResolverFactory(
  EntityVersion: Type<unknown>,
  versioningServiceToken: symbol,
) {
  const { entityToken, entityDescription } = EntityStore.get(EntityVersion);
  const entityTokenDescription = entityToken.description;

  const findAllVersionsForOneOriginalIdName = `findAll${entityTokenDescription}sForOneOriginalId`;
  const findOneByIdName = `findOne${entityTokenDescription}ById`;

  @Resolver(() => EntityVersion)
  class EntityVersionResolver {
    constructor(
      @Inject(versioningServiceToken)
      readonly versioningService: VersioningService<unknown>,
    ) {}

    @Query(() => [EntityVersion], {
      name: findAllVersionsForOneOriginalIdName,
      description: `${entityDescription} : Find all versions for one original id query`,
    })
    public async findAllVersionsForOneOriginalId(
      @Args('originalId', { type: () => IdScalar })
      originalId: Id,
    ) {
      return this.versioningService.findAllVersionsForOneOriginalId(originalId);
    }

    @Query(() => EntityVersion, {
      name: findOneByIdName,
      description: `${entityDescription} : Find one version by id query`,
    })
    public async findOneById(
      @Args('id', { type: () => IdScalar })
      id: Id,
    ) {
      return this.versioningService.findOneById(id);
    }
  }

  return EntityVersionResolver;
}
