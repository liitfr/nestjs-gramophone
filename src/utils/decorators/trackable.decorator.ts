import { Field, ObjectType } from '@nestjs/graphql';
import {
  EntityDecorator,
  entityDescription,
  entityName,
  getEntityDescription,
  getEntityName,
} from '../entity-decorator.type';
import { Prop, Schema } from '@nestjs/mongoose';
import { pluralize } from 'mongoose';

export interface Trackable {
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const plFn = pluralize();

export function Trackable() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const entityNameValue = getEntityName(constructor);
    const entityDescriptionValue = getEntityDescription(constructor);

    @ObjectType(entityNameValue)
    @Schema({ collection: plFn(entityNameValue) })
    class Tracked extends constructor implements EntityDecorator {
      static [entityName] = entityNameValue;
      static [entityDescription] = entityDescriptionValue;

      @Field({
        nullable: false,
        description: `${entityDescriptionValue}\'s created by`,
      })
      @Prop()
      createdBy: string;

      @Field({
        nullable: false,
        description: `${entityDescriptionValue}\'s updated by`,
      })
      @Prop()
      updatedBy: string;

      @Field({
        nullable: false,
        description: `${entityDescriptionValue}\'s created at`,
      })
      @Prop()
      createdAt: Date;

      @Field({
        nullable: false,
        description: `${entityDescriptionValue}\'s updated at`,
      })
      @Prop()
      updatedAt: Date;
    }

    return Tracked;
  };
}
