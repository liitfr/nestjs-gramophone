import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

import {
  entityDescription,
  entityName,
  getEntityDescription,
  getEntityName,
} from '../entity-decorator';
import { pluralizeEntityName } from '../pluralize-entity-name';

export interface Memoable {
  memo?: string;
}

export function Memoable() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const entityNameValue = getEntityName(constructor);
    const entityDescriptionValue = getEntityDescription(constructor);

    @ObjectType(entityNameValue)
    @Schema({ collection: pluralizeEntityName(entityNameValue) })
    class Memoed extends constructor {
      static [entityName] = entityNameValue;
      static [entityDescription] = entityDescriptionValue;

      @Field({
        nullable: true,
        description: `${entityDescriptionValue}\'s memo`,
      })
      @Prop({
        type: String,
        required: false,
      })
      memo?: string;

      @Field({
        nullable: true,
        description: `${entityDescriptionValue}\'s internal memo`,
      })
      @Prop({
        type: String,
        required: false,
      })
      internalMemo?: string;

      @Field({
        nullable: true,
        description: `${entityDescriptionValue}\'s automatic memo`,
        defaultValue: 'Memo automatique généré via GraphQL',
      })
      @Prop({
        type: String,
        required: true,
      })
      automaticMemo: string;
    }

    return Memoed;
  };
}
