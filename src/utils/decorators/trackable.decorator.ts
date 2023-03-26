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

export interface Trackable {
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export function Trackable() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const entityNameValue = getEntityName(constructor);
    const entityDescriptionValue = getEntityDescription(constructor);

    @ObjectType(entityNameValue)
    @Schema({ collection: pluralizeEntityName(entityNameValue) })
    class Tracked extends constructor implements EntityDecorator {
      static [entityName] = entityNameValue;
      static [entityDescription] = entityDescriptionValue;

      @Field({
        nullable: false,
        description: `${entityDescriptionValue}\'s created by`,
      })
      @Prop({
        type: String,
        required: true,
        default: 'admin',
      })
      createdBy: string;

      @Field({
        nullable: false,
        description: `${entityDescriptionValue}\'s updated by`,
      })
      @Prop({
        type: String,
        required: true,
        default: 'admin',
      })
      updatedBy: string;

      @Field({
        nullable: false,
        description: `${entityDescriptionValue}\'s created at`,
      })
      @Prop({
        type: Date,
        required: true,
        default: new Date(),
      })
      createdAt: Date;

      @Field({
        nullable: false,
        description: `${entityDescriptionValue}\'s updated at`,
      })
      @Prop({
        type: Date,
        required: true,
        default: new Date(),
      })
      updatedAt: Date;
    }

    Object.defineProperty(Tracked, 'name', { value: constructor.name });

    return Tracked;
  };
}
