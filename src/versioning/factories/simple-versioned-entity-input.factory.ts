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

export function SimpleVersionedEntityInputFactory<E extends object>(
  Entity: Type<E>,
  options?: SimpleEntityInputFactoryOptions<E>,
): SimpleInput<E> {
  const { entityToken, entityDescription } = EntityStore.get(Entity);

  Logger.verbose(
    `SimpleVersionedEntityInput for ${entityToken.description}`,
    'SimpleVersionedEntityInputFactory',
  );

  @InputType()
  class WithVersionDataInput {
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
