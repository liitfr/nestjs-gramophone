import { Field, ObjectType } from '@nestjs/graphql';
import {
  entityDescription,
  entityName,
  getEntityDescription,
  getEntityName,
} from '../entity-decorator.type';
import { Prop, Schema } from '@nestjs/mongoose';
import { pluralize } from 'mongoose';

export interface Memoable {
  memo?: string;
}

const plFn = pluralize();

export function Memoable() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const entityNameValue = getEntityName(constructor);
    const entityDescriptionValue = getEntityDescription(constructor);

    @ObjectType(entityNameValue)
    @Schema({ collection: plFn(entityNameValue) })
    class Memoed extends constructor {
      static [entityName] = entityNameValue;
      static [entityDescription] = entityDescriptionValue;

      @Field({
        nullable: true,
        description: `${entityDescriptionValue}\'s memo`,
      })
      @Prop()
      memo?: string;
    }

    return Memoed;
  };
}
