import {
  Logger,
  SetMetadata,
  Type,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';

import { IS_PUBLIC_KEY } from '../../authentication/decorators/public.decorator';

import { EntityStore } from '../entities/entity-store.service';

import { getDefaultGeneralOptions } from './options/general-options';
import { ResolverOptions } from './types/options.type';
import { BaseResolverStore } from './base-resolver-store.service';

export function generateBaseResolverOptions<E extends object>(
  Entity: Type<E>,
  pOptions?: ResolverOptions<E>,
) {
  return {
    ...pOptions,
    general: {
      ...getDefaultGeneralOptions(Entity),
      ...(pOptions?.general ?? {}),
    },
  };
}

export function BaseResolverFactory<E extends object>(
  Entity: Type<E>,
  pOptions?: ResolverOptions<E>,
) {
  const { entityToken, entityDescription } = EntityStore.get(Entity);

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
    `BaseResolver for ${entityTokenDescription}`,
    'BaseResolverFactory',
  );

  const options = generateBaseResolverOptions(Entity, pOptions);

  @Resolver(() => Entity)
  @UseGuards(...(options.general?.resolverGuards ?? []))
  @UseInterceptors(...(options.general?.resolverInterceptors ?? []))
  @UseFilters(...(options.general?.resolverFilters ?? []))
  @SetMetadata(IS_PUBLIC_KEY, options.general?.resolverPublic ?? false)
  class BaseResolver {}

  BaseResolverStore.register(Entity, BaseResolver, options);

  return BaseResolver;
}
