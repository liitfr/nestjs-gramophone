import { Field, InputType, IntersectionType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

import { getEntityMetadata } from '../../utils/entity-enhancers/entity.util';
import { SimpleEntityInputFactory } from '../../utils/dto/simple-entity-input.factory';

import { VERSION_DATA_FIELDNAME } from '../decorators/save-version-if-enabled.decorator';

import { VersionDataInput } from './version-data.input';

export function SimpleVersionedEntityInputFactory<T>(classRef: Type<T>) {
  const entityDescription = getEntityMetadata(classRef)?.entityDescription;

  if (!entityDescription) {
    throw new Error('Entity ' + classRef.name + ' : description not found');
  }

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
    SimpleEntityInputFactory(classRef),
    WithVersionDataInput,
  );
}
