import { Field, InputType, IntersectionType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

import { entityDescription } from '../../utils/entity-enhancers/enhancers.util';
import { SimpleEntityInputFactory } from '../../utils/dto/simple-entity-input.factory';

import { VersionDataInput } from './version-data.input';

export function SimpleVersionedEntityInputFactory<T>(classRef: Type<T>) {
  const entityDescriptionValue = classRef[entityDescription];

  @InputType()
  class WithVersionDataInput {
    @Field(() => VersionDataInput, {
      nullable: true,
      defaultValue: {
        automaticMemo: 'Memo automatique généré via GraphQL',
      },
      description: `${entityDescriptionValue}\'s version data`,
    })
    versionData?: VersionDataInput;
  }

  return IntersectionType(
    SimpleEntityInputFactory(classRef),
    WithVersionDataInput,
  );
}
