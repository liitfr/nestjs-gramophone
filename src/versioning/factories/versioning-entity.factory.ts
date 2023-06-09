import { Logger, Type } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

import { IdScalar } from '../../utils/scalars/id.scalar';
import { generateCollectionName } from '../../utils/utils/string.util';
import { Id } from '../../utils/types/id.type';
import { SimpleEntity } from '../../utils/entities/simple-entity.decorator';
import { CreateRepository } from '../../data/decorators/create-repository.decorator';
import { EntityStore } from '../../utils/entities/entity-store.service';
import { SetEntityMetadata } from '../../utils/entities/set-entity-metadata.decorator';
import { SetEntityToken } from '../../utils/entities/set-entity-token.decorator';
import { SimpleRepositoryOutputObj } from '../../utils/resolvers/types/simple-repository-output.type';
import { Memoable } from '../../utils/types/memoable.type';

import { versioningServices } from '../decorators/versioned.decorator';
import { VersionDataInput } from '../dtos/version-data.input';
import { IdableAndTrackable } from '../types/idable-and-trackable.type';

export interface IVersioningEntity<E extends IdableAndTrackable>
  extends IdableAndTrackable,
    Memoable,
    VersionDataInput {
  originalId: Id;
  version: SimpleRepositoryOutputObj<E>;
}

export function VersioningEntityFactory<E extends IdableAndTrackable>(
  Entity: Type<E>,
): Type<IVersioningEntity<E>> {
  const originalMetadata = EntityStore.get(Entity);
  const {
    entityToken: versionedEntityToken,
    entityDescription: versionedEntityDescription,
  } = originalMetadata;

  const EntitySchema = SchemaFactory.createForClass(Entity);

  const versionedEntityTokenDescription = versionedEntityToken.description;

  if (!versionedEntityTokenDescription) {
    throw new Error(
      `Description not found for token ${versionedEntityToken.toString()}`,
    );
  }

  const versioningEntityToken: unique symbol = Symbol(
    `${versionedEntityTokenDescription}Version`,
  );

  const versioningEntityTokenDescription = versioningEntityToken.description;

  if (!versioningEntityTokenDescription) {
    throw new Error(
      `Description not found for token ${versioningEntityToken.toString()}`,
    );
  }

  Logger.verbose(
    `VersioningEntity for ${versioningEntityTokenDescription}`,
    'VersioningEntityFactory',
  );

  const versioningEntityServiceToken = versioningServices.find((vS) => {
    const { entityToken } = EntityStore.get(vS.VersionedEntity);
    return entityToken === versionedEntityToken;
  })?.versioningServiceToken;

  if (!versioningEntityServiceToken) {
    throw new Error('Versioning service not found');
  }

  const versioningEntityDescription = `${versionedEntityDescription} Version`;

  if (!generateCollectionName) {
    throw new Error('Collection name generator not found');
  }

  const collectionName = generateCollectionName(
    versioningEntityTokenDescription,
  );

  @ObjectType(versioningEntityTokenDescription)
  @Schema({
    collection: collectionName,
  })
  @CreateRepository<MongooseSchema>({
    SchemaTransformer: (Schema) =>
      Schema.index({ originalId: 1, updatedAt: 1 }, { unique: true })
        .index({ originalId: 1 })
        .index({ updatedAt: 1 }),
  })
  // set metadata after simple entity decorator
  @SetEntityMetadata({
    entityToken: versioningEntityToken,
    entityDescription: versioningEntityDescription,
    entityServiceToken: versioningEntityServiceToken,
  })
  @SimpleEntity({ isTrackable: true, isMemoable: true })
  // set metadata before simple entity decorator
  @SetEntityMetadata({
    entityToken: versioningEntityToken,
    entityDescription: versioningEntityDescription,
    entityServiceToken: versioningEntityServiceToken,
  })
  @SetEntityToken(versioningEntityToken)
  class VersioningEntity {
    @Field(() => IdScalar, {
      nullable: false,
      description: `${versioningEntityDescription}'s original id`,
    })
    @Prop({
      type: MongooseSchema.Types.ObjectId,
      ref: versionedEntityTokenDescription,
      autopopulate: false,
      required: true,
    })
    originalId: Id;

    @Field(() => Entity, {
      nullable: false,
      description: `${versioningEntityDescription}'s version`,
    })
    @Prop({ type: EntitySchema, required: true })
    version: HydratedDocument<E>;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface VersioningEntity extends IVersioningEntity<E> {}

  return VersioningEntity;
}
