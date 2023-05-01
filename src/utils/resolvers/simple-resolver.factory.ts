import { Inject, Logger, Type } from '@nestjs/common';
import { InputType, PartialType } from '@nestjs/graphql';

import { SimpleServiceObj } from '../services/simple-service.factory';
import { checkIfIsTrackable } from '../entities/simple-entity.decorator';
import { SimpleInput } from '../dtos/simple-entity-input.factory';
import { EntityStore } from '../entities/entity-store.service';

import { WithCountAll } from './decorators/count-all.decorator';
import { WithCountSome } from './decorators/count-some.decorator';
import { WithCreate } from './decorators/create.decorator';
import { WithFindAll } from './decorators/find-all.decorator';
import { WithFindOneAndUpdate } from './decorators/find-one-and-update.decorator';
import { WithFindOne } from './decorators/find-one.decorator';
import { WithFindSome } from './decorators/find-some.decorator';
import { WithRemove } from './decorators/remove.decorator';
import { WithUpdateMany } from './decorators/update-many.decorator';
import { WithUpdateOne } from './decorators/update-one.decorator';
import {
  BaseResolverFactory,
  generateBaseResolverOptions,
} from './base-resolver.factory';
import { ResolverOptions } from './types/options.type';

export function SimpleResolverFactory<
  E extends object,
  S extends SimpleServiceObj<E>,
>(
  Entity: Type<E>,
  Input: Type<unknown>, // BUG : somehow it should depend on E if only i could generate correct type for inputs
  Service: Type<S>,
  pOptions?: ResolverOptions<E>,
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

  const options = generateBaseResolverOptions(Entity, pOptions);

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

  @WithUpdateOne<E>(decoratorParameters)
  @WithUpdateMany<E>(decoratorParameters)
  @WithRemove<E>(decoratorParameters)
  @WithFindSome<E>(decoratorParameters)
  @WithFindOne<E>(decoratorParameters)
  @WithFindOneAndUpdate<E>(decoratorParameters)
  @WithFindAll<E>(decoratorParameters)
  @WithCreate<E>(decoratorParameters)
  @WithCountSome<E>(decoratorParameters)
  @WithCountAll<E>(decoratorParameters)
  class SimpleResolver extends BaseResolverFactory(Entity, options) {
    @Inject(Service)
    readonly simpleService!: S;
  }

  return SimpleResolver;
}
