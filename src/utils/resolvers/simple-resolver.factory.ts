import {
  Inject,
  Logger,
  SetMetadata,
  Type,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InputType, PartialType, Resolver } from '@nestjs/graphql';

import { IS_PUBLIC_KEY } from '../../authentication/decorators/public.decorator';

import {
  SimpleService,
  SimpleServiceObj,
} from '../services/simple-service.factory';
import { checkIfIsTrackable } from '../entities/simple-entity.decorator';
import { SimpleInput } from '../dtos/simple-entity-input.factory';
import { EntityStore } from '../entities/entity-store.service';

import { getDefaultGeneralOptions } from './options/general-options';
import { WithCountAll } from './decorators/count-all.decorator';
import { WithCountSome } from './decorators/count-some.decorator';
import { WithCreate } from './decorators/create.decorator';
import { WithFindAll } from './decorators/find-all.decorator';
import { WithFindOneAndUpdate } from './decorators/find-one-and-update.decorator';
import { WithFindOne } from './decorators/find-one.decorator';
import { WithFindSome } from './decorators/find-some.decorator';
import { WithRelationPartitionCount } from './decorators/relation-partition-count.decorator';
import { WithRelationPartitionFind } from './decorators/relation-partition-find.decorator';
import { WithRelationResolve } from './decorators/relation-resolve.decorator';
import { WithRemove } from './decorators/remove.descriptor';
import { WithReversedRelationId } from './decorators/reversed-relation-id.decorator';
import { WithReversedRelationResolve } from './decorators/reversed-relation-resolve.decorator';
import { WithUpdateMany } from './decorators/update-many.decorator';
import { WithUpdateOne } from './decorators/update-one.decorator';
import { Options } from './types/options.type';

export function SimpleResolverFactory<
  E extends object,
  S extends SimpleServiceObj<E>,
>(
  Entity: Type<E>,
  Input: Type<unknown>, // BUG : somehow it should depend on E if only i could generate correct type for inputs
  Service: SimpleService<E>,
  pOptions?: Options<E>,
) {
  const { entityToken, entityDescription, entityRelations } =
    EntityStore.get(Entity);

  const entityTokenDescription = entityToken.description;

  if (!entityDescription) {
    throw new Error(`Description not found for entity ${Entity.name}`);
  }

  if (!entityTokenDescription) {
    throw new Error(
      `Description not found for token ${entityToken.toString()}`,
    );
  }

  Logger.verbose(
    `SimpleResolver for ${entityTokenDescription}`,
    'SimpleResolverFactory',
  );

  const isTrackable = checkIfIsTrackable(Entity);

  const hasRelations = entityRelations && entityRelations?.length > 0;

  @InputType(`${entityTokenDescription}PartialInput`)
  class PartialInput extends PartialType(Input) {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface PartialInput extends SimpleInput<E> {}

  const options = {
    ...pOptions,
    general: {
      ...getDefaultGeneralOptions(Entity),
      ...(pOptions?.general ?? {}),
    },
  };

  const decoratorParameters = {
    Entity,
    options,
    Input,
    PartialInput,
    entityDescription,
    entityToken,
    entityTokenDescription,
    isTrackable,
    entityRelations: entityRelations ?? [],
    hasRelations: hasRelations ?? false,
  };

  @Resolver(() => Entity)
  @UseGuards(...(options.general?.resolverGuards ?? []))
  @UseInterceptors(...(options.general?.resolverInterceptors ?? []))
  @UseFilters(...(options.general?.resolverFilters ?? []))
  @SetMetadata(IS_PUBLIC_KEY, options.general?.resolverPublic ?? false)
  @WithUpdateOne<E>(decoratorParameters)
  @WithUpdateMany<E>(decoratorParameters)
  @WithReversedRelationResolve<E>(decoratorParameters)
  @WithReversedRelationId<E>(decoratorParameters)
  @WithRemove<E>(decoratorParameters)
  @WithRelationResolve<E>(decoratorParameters)
  @WithRelationPartitionFind<E>(decoratorParameters)
  @WithRelationPartitionCount<E>(decoratorParameters)
  @WithFindSome<E>(decoratorParameters)
  @WithFindOne<E>(decoratorParameters)
  @WithFindOneAndUpdate<E>(decoratorParameters)
  @WithFindAll<E>(decoratorParameters)
  @WithCreate<E>(decoratorParameters)
  @WithCountSome<E>(decoratorParameters)
  @WithCountAll<E>(decoratorParameters)
  class SimpleResolver {
    @Inject(Service)
    readonly simpleService!: S;
  }

  return SimpleResolver;
}
