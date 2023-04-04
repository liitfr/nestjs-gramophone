import { SetMetadata, Type } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

import { IdScalar } from '../../utils/scalars/id.scalar';
import {
  ENTITY_METADATA,
  EntityMetadata,
  getEntityMetadata,
} from '../../utils/entities/entity.util';
import { generateCollectionName } from '../../utils/string.util';
import { Id } from '../../utils/id.type';
import { SimpleEntity } from '../../utils/entities/simple-entity.decorator';

export function VersioningEntityFactory(Entity: Type<unknown>) {
  const originalMetadata = getEntityMetadata(Entity);
  const { entityName, entityDescription } = originalMetadata;

  const EntitySchema = SchemaFactory.createForClass(Entity);

  const newEntityName = `${entityName}Version`;
  const newEntityDescription = `${entityDescription} Version`;

  @ObjectType(newEntityName)
  @Schema({
    collection: generateCollectionName(newEntityName),
  })
  @SimpleEntity({ isIdable: true, isTrackable: true, isMemoable: true })
  @SetMetadata<symbol, EntityMetadata>(ENTITY_METADATA, {
    entityName: newEntityName,
    entityDescription: newEntityDescription,
  })
  class EntityVersion {
    @Field(() => IdScalar, {
      nullable: false,
      description: `${newEntityDescription}'s original id`,
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
      description: `${newEntityDescription}'s version`,
    })
    @Prop({ type: EntitySchema, required: true })
    version: typeof Entity;
  }

  const EntityVersionSchema = SchemaFactory.createForClass(EntityVersion);

  return { EntityVersion, EntityVersionSchema };
}
