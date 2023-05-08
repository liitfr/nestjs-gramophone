import { Field, InputType, IntersectionType } from '@nestjs/graphql';
import { Logger, Type } from '@nestjs/common';

import {
  SimpleEntityInputFactory,
  SimpleEntityInputFactoryOptions,
  SimpleInput,
} from '../../utils/dtos/simple-entity-input.factory';
import { EntityStore } from '../../utils/entities/entity-store.service';

import { VERSION_DATA_FIELDNAME } from '../decorators/save-version-if-enabled.decorator';

import { VersionDataInput } from '../dtos/version-data.input';

export interface IWithVersionDataInput {
  [VERSION_DATA_FIELDNAME]?: VersionDataInput;
}

export function SimpleVersionedEntityInputFactory<
  TEntity extends object,
  TRemove extends readonly (keyof TEntity)[] = [],
  TAdd extends Array<Type> = [],
>(
  Entity: Type<TEntity>,
  options?: SimpleEntityInputFactoryOptions<TEntity, TRemove, TAdd>,
): SimpleInput<TEntity, TRemove, [...TAdd, Type<IWithVersionDataInput>]> {
  const { entityToken, entityDescription } = EntityStore.get(Entity);

  Logger.verbose(
    `SimpleVersionedEntityInput for ${entityToken.description}`,
    'SimpleVersionedEntityInputFactory',
  );

  @InputType()
  class WithVersionDataInput implements IWithVersionDataInput {
    @Field(() => VersionDataInput, {
      nullable: true,
      description: `${entityDescription}'s version data`,
    })
    [VERSION_DATA_FIELDNAME]?: VersionDataInput;
  }

  return IntersectionType(
    SimpleEntityInputFactory(Entity, options),
    WithVersionDataInput,
  );
}
