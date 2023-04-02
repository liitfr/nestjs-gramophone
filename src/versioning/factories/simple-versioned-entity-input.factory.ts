import { Field, InputType, IntersectionType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

import { getEntityMetadata } from '../../utils/entities/entity.util';
import { SimpleEntityInputFactory } from '../../utils/dtos/simple-entity-input.factory';

import { VERSION_DATA_FIELDNAME } from '../decorators/save-version-if-enabled.decorator';

import { VersionDataInput } from '../dtos/version-data.input';

export function SimpleVersionedEntityInputFactory<T>(Entity: Type<T>) {
  const entityDescription = getEntityMetadata(Entity)?.entityDescription;

  @InputType()
  class WithVersionDataInput {
    @Field(() => VersionDataInput, {
      nullable: true,
      defaultValue: {
        automaticMemo: 'Memo automatique généré via GraphQL',
      },
      description: `${entityDescription}'s version data`,
    })
    [VERSION_DATA_FIELDNAME]?: VersionDataInput;
  }

  return IntersectionType(
    SimpleEntityInputFactory(Entity),
    WithVersionDataInput,
  );
}
