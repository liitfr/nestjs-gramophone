import { Type } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types as MongooseTypes } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

import { MongoObjectIdScalar } from '../../utils/scalars/mongo-id.scalar';
import {
  entityDescription,
  entityName,
  getEntityDescription,
  getEntityName,
} from '../../utils/entity-decorator';
import { pluralizeEntityName } from '../../utils/pluralize-entity-name';
import { Memoable } from '../../utils/decorators/memoable.decorator';
import { Trackable } from '../../utils/decorators/trackable.decorator';

export function modelFactory(Entity: Type<unknown>) {
  const entityDescriptionValue = getEntityDescription(Entity);
  const entityNameValue = getEntityName(Entity);

  const EntitySchema = SchemaFactory.createForClass(Entity);

  const newEntityName = `${entityNameValue}Version`;
  const newEntityDescription = `${entityDescriptionValue} Version`;

  @Trackable()
  @Memoable()
  @ObjectType(newEntityName)
  @Schema({
    collection: pluralizeEntityName(newEntityName),
  })
  class EntityVersion {
    static [entityName] = newEntityName;
    static [entityDescription] = newEntityDescription;

    @Field(() => MongoObjectIdScalar, {
      nullable: false,
      description: `${newEntityDescription}\'s id`,
    })
    _id: MongooseTypes.ObjectId;

    @Field(() => MongoObjectIdScalar, {
      nullable: false,
      description: `${newEntityDescription}\'s original id`,
    })
    @Prop({
      type: MongooseSchema.Types.ObjectId,
      ref: entityNameValue,
      autopopulate: false,
      required: true,
    })
    originalId: MongooseTypes.ObjectId;

    @Field(() => Entity, {
      nullable: false,
      description: `${newEntityDescription}\'s version`,
    })
    @Prop({ type: EntitySchema, required: true })
    version: typeof Entity;
  }

  const EntityVersionSchema = SchemaFactory.createForClass(EntityVersion);

  return { EntityVersion, EntityVersionSchema };
}
