import { Logger, Provider } from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';

import { EntityStore } from '../../utils/entities/entity-store.service';
import { BaseResolverStore } from '../../utils/resolvers/base-resolver-store.service';
import {
  BaseResolverFactory,
  generateBaseResolverOptions,
} from '../../utils/resolvers/base-resolver.factory';

import { WithRelationPartitionCount } from '../decorators/relation-partition-count.decorator';
import { WithRelationPartitionFind } from '../decorators/relation-partition-find.decorator';
import { WithRelationResolve } from '../decorators/relation-resolve.decorator';
import { WithReversedRelationId } from '../decorators/reversed-relation-id.decorator';
import { WithReversedRelationResolve } from '../decorators/reversed-relation-resolve.decorator';

export const RelationResolversFactory = () => {
  const result: Provider[] = [];

  for (const entity of EntityStore.getAll()) {
    const {
      Entity: Source,
      entityRelations,
      entityToken: sourceToken,
    } = entity;

    if (entityRelations && entityRelations.length > 0) {
      const sourceResolver = BaseResolverStore.uncertainGetByEntity(Source);

      const sourceBaseResolverOptions =
        sourceResolver?.baseResolverOptions ??
        generateBaseResolverOptions(Source);
      const SourceBaseResolver =
        sourceResolver?.BaseResolver ??
        BaseResolverFactory(Source, sourceBaseResolverOptions);

      const sourceTokenDescription = sourceToken.description;

      if (!sourceTokenDescription) {
        throw new Error(
          `Description not found for token ${sourceToken.toString()}`,
        );
      }

      const relationsMetadata = EntityStore.getRelationsMetadata(sourceToken);

      const relationDecoratorParams = {
        Source,
        options: sourceBaseResolverOptions,
        relationsMetadata,
        sourceToken,
        sourceTokenDescription,
      };

      @Resolver(() => Source)
      @WithRelationResolve(relationDecoratorParams)
      @WithRelationPartitionCount(relationDecoratorParams)
      @WithRelationPartitionFind(relationDecoratorParams)
      class RelationResolver extends SourceBaseResolver {}

      Logger.verbose(
        `RelationResolver for ${sourceTokenDescription}`,
        'RelationResolversFactory',
      );
      result.push(RelationResolver);
    }

    const Target = Source;
    const targetToken = sourceToken;

    const reversedRelationsMetadata =
      EntityStore.getReversedRelationsMetadata(targetToken);

    if (reversedRelationsMetadata && reversedRelationsMetadata.length > 0) {
      const targetResolver = BaseResolverStore.uncertainGetByEntity(Target);

      const targetBaseResolverOptions =
        targetResolver?.baseResolverOptions ??
        generateBaseResolverOptions(Target);
      const TargetBaseResolver =
        targetResolver?.BaseResolver ??
        BaseResolverFactory(Target, targetBaseResolverOptions);

      const targetTokenDescription = targetToken.description;

      if (!targetTokenDescription) {
        throw new Error(
          `Description not found for token ${targetToken.toString()}`,
        );
      }

      const reversedRelationDecoratorParams = {
        Target,
        options: targetBaseResolverOptions,
        reversedRelationsMetadata,
        targetToken,
        targetTokenDescription,
      };

      @Resolver(() => Target)
      @WithReversedRelationId(reversedRelationDecoratorParams)
      @WithReversedRelationResolve(reversedRelationDecoratorParams)
      class ReversedRelationResolver extends TargetBaseResolver {}

      Logger.verbose(
        `ReversedRelationResolver for ${targetTokenDescription}`,
        'RelationResolversFactory',
      );
      result.push(ReversedRelationResolver);
    }
  }

  return result;
};
