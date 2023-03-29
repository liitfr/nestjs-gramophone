import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

import {
  EntityDecorator,
  entityDescription,
  entityName,
  getEntityDescription,
  getEntityName,
} from '../entity-decorator';
import { pluralizeEntityName } from '../pluralize-entity-name';
import { Type } from '@nestjs/common';

export const isMemoable = Symbol('isMemoable');

export interface Memoable {
  memo?: string;
}

export const checkIfIsMemoable = (classRef: Type): classRef is Type<Memoable> =>
  !!Object.getOwnPropertyDescriptor(classRef, isMemoable);

export function Memoable() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const entityNameValue = getEntityName(constructor);
    const entityDescriptionValue = getEntityDescription(constructor);

    @ObjectType(entityNameValue)
    @Schema({ collection: pluralizeEntityName(entityNameValue) })
    class Memoed extends constructor implements EntityDecorator, Memoable {
      static [entityName] = entityNameValue;
      static [entityDescription] = entityDescriptionValue;
      static [isMemoable] = true;

      @Field({
        nullable: true,
        description: `${entityDescriptionValue}'s memo`,
      })
      @Prop({
        type: String,
        required: false,
      })
      memo?: string;

      @Field({
        nullable: true,
        description: `${entityDescriptionValue}'s internal memo`,
      })
      @Prop({
        type: String,
        required: false,
      })
      internalMemo?: string;

      @Field({
        nullable: true,
        description: `${entityDescriptionValue}'s automatic memo`,
        defaultValue: 'Memo automatique généré via GraphQL',
      })
      @Prop({
        type: String,
        required: true,
      })
      automaticMemo: string;
    }

    Object.defineProperty(Memoed, 'name', { value: constructor.name });

    return Memoed;
  };
}
