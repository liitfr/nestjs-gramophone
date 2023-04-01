import { SetMetadata, Type } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

import { IdScalar } from '../../utils/scalars/id.scalar';
import {
  ENTITY_METADATA,
  EntityMetadata,
  getEntityMetadata,
} from '../../utils/entity-enhancers/entity.util';
import { generateCollectionName } from '../../utils/string.util';
import { Memoable } from '../../utils/entity-enhancers/memoable.decorator';
import { Trackable } from '../../utils/entity-enhancers/trackable.decorator';
import { Id } from '../../utils/id.type';

export function modelFactory(Entity: Type<unknown>) {
  const { entityName, entityDescription } = getEntityMetadata(Entity);

  const EntitySchema = SchemaFactory.createForClass(Entity);

  const newEntityName = `${entityName}Version`;
  const newEntityDescription = `${entityDescription} Version`;

  @Trackable()
  @Memoable()
  @SetMetadata<symbol, EntityMetadata>(ENTITY_METADATA, {
    entityName: newEntityName,
    entityDescription: newEntityDescription,
  })
  @ObjectType(newEntityName)
  @Schema({
    collection: generateCollectionName(newEntityName),
  })
  class EntityVersion {
    @Field(() => IdScalar, {
      nullable: false,
      description: `${newEntityDescription}\'s id`,
    })
    _id: Id;

    @Field(() => IdScalar, {
      nullable: false,
      description: `${newEntityDescription}\'s original id`,
    })
    @Prop({
      type: MongooseSchema.Types.ObjectId,
      ref: entityName,
      autopopulate: false,
      required: true,
    })
    originalId: Id;

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
