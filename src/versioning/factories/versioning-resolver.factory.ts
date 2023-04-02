import { Inject, Type } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { IdScalar } from '../../utils/scalars/id.scalar';
import { getEntityMetadata } from '../../utils/entities/entity.util';
import { Id } from '../../utils/id.type';

import { VersioningService } from '../services/versioning.service';

export function VersioningResolverFactory(
  EntityVersion: Type<unknown>,
  providerName: string,
) {
  const { entityName, entityDescription } = getEntityMetadata(EntityVersion);

  @Resolver(() => EntityVersion)
  class EntityVersionResolver {
    constructor(
      @Inject(providerName)
      readonly versioningService: VersioningService<unknown>,
    ) {}

    @Query(() => [EntityVersion], {
      name: `findAll${entityName}sForOneOriginalId`,
      description: `${entityDescription} : Find all versions for one original id query`,
    })
    public async findAllVersionsForOneOriginalId(
      @Args('originalId', { type: () => IdScalar })
      originalId: Id,
    ) {
      return this.versioningService.findAllVersionsForOneOriginalId(originalId);
    }

    @Query(() => EntityVersion, {
      name: `findOne${entityName}ById`,
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
