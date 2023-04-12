import { Logger, SetMetadata, Type } from '@nestjs/common';
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
import { CreateRepository } from '../../data/decorators/create-repository.decorator';

import { versioningServices } from '../decorators/versioned.decorator';

export function VersioningEntityFactory(Entity: Type<unknown>) {
  const originalMetadata = getEntityMetadata(Entity);
  const {
    entityToken: versionedEntityToken,
    entityDescription: versionedEntityDescription,
  } = originalMetadata;

  const EntitySchema = SchemaFactory.createForClass(Entity);

  const versioningEntityToken = Symbol(
    `${versionedEntityToken.description}Version`,
  );

  Logger.verbose(
    `VersioningEntity for ${versioningEntityToken.description}`,
    'VersioningEntityFactory',
  );

  const versioningEntityServiceToken = versioningServices.find((vS) => {
    const { entityToken } = getEntityMetadata(vS.VersionedEntity);
    return entityToken === versionedEntityToken;
  })?.versioningServiceToken;

  if (!versioningEntityServiceToken) {
    throw new Error('Versioning service not found');
  }

  const versioningEntityDescription = `${versionedEntityDescription} Version`;

  @ObjectType(versioningEntityToken.description)
  @Schema({
    collection: generateCollectionName(versioningEntityToken.description),
  })
  @CreateRepository({
    SchemaFactory: (Schema: MongooseSchema) =>
      Schema.index({ originalId: 1, versionedAt: 1 }, { unique: true })
        .index({ originalId: 1 })
        .index({ versionedAt: 1 }),
  })
  // set metadata after simple entity decorator
  @SetMetadata<symbol, EntityMetadata>(ENTITY_METADATA, {
    entityToken: versioningEntityToken,
    entityDescription: versioningEntityDescription,
    entityServiceToken: versioningEntityServiceToken,
  })
  @SimpleEntity({ isIdable: true, isTrackable: true, isMemoable: true })
  // set metadata before simple entity decorator
  @SetMetadata<symbol, EntityMetadata>(ENTITY_METADATA, {
    entityToken: versioningEntityToken,
    entityDescription: versioningEntityDescription,
    entityServiceToken: versioningEntityServiceToken,
  })
  class VersioningEntity {
    @Field(() => IdScalar, {
      nullable: false,
      description: `${versioningEntityDescription}'s original id`,
    })
    @Prop({
      type: MongooseSchema.Types.ObjectId,
      ref: versionedEntityToken.description,
      autopopulate: false,
      required: true,
    })
    originalId: Id;

    @Field(() => Entity, {
      nullable: false,
      description: `${versioningEntityDescription}'s version`,
    })
    @Prop({ type: EntitySchema, required: true })
    version: typeof Entity;
  }

  return VersioningEntity;
}
