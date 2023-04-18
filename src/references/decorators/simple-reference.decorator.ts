import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

import { SimpleEntity } from '../../utils/entities/simple-entity.decorator';
import { generateCollectionName, pascalCase } from '../../utils/string.util';
import { Id } from '../../utils/id.type';
import { EntityStore } from '../../utils/entities/entity-store.service';
import {
  SetEntityMetadata,
  SetEntityToken,
} from '../../utils/entities/set-entity-metadata.decorator';
import {
  EntityMetadata,
  getEntityToken,
} from '../../utils/entities/entity.util';

import { Chip, ChipSchemas } from '../entities/chip.entity';

import { SetReferenceMetadata } from './set-reference-metadata.decorator';

interface Options {
  addChip?: boolean;
  partitioner?: string;
  partitionerDescription?: string;
}

export function SimpleReference(
  Partition: Record<string, string>,
  {
    addChip = false,
    partitioner = 'code',
    partitionerDescription = 'code',
  }: Options = {
    addChip: false,
    partitioner: 'code',
    partitionerDescription: 'code',
  },
) {
  return <T extends { new (...args: any[]): object }>(constructor: T) => {
    let originalMetadata: Partial<EntityMetadata>;

    if (!getEntityToken(constructor)) {
      const token = Symbol(constructor.name);
      SetEntityToken(token)(constructor);
      originalMetadata = {
        entityToken: token,
        entityDescription: pascalCase(constructor.name),
      };
      SetEntityMetadata(originalMetadata)(constructor);
    } else {
      originalMetadata = EntityStore.get(constructor);
    }

    Object.defineProperties(constructor.prototype, {
      [partitioner]: { enumerable: true, configurable: true, writable: true },
      version: { enumerable: true, configurable: true, writable: true },
      index: { enumerable: true, configurable: true, writable: true },
      label: { enumerable: true, configurable: true, writable: true },
      isSelectedByDefault: {
        enumerable: true,
        configurable: true,
        writable: true,
      },
    });

    Field(() => Partition, {
      nullable: false,
      description: `${originalMetadata.entityDescription}'s ${partitionerDescription}`,
    })(constructor.prototype, partitioner);

    Prop({
      type: String,
      required: true,
      enum: Partition,
      unique: true,
      index: true,
    })(constructor.prototype, partitioner);

    Field(() => Int, {
      nullable: false,
      description: `${originalMetadata.entityDescription}'s version`,
    })(constructor.prototype, 'version');

    Prop({ type: Number, required: true })(constructor.prototype, 'version');

    Field(() => Int, {
      nullable: false,
      description: `${originalMetadata.entityDescription}'s index`,
    })(constructor.prototype, 'index');

    Prop({ type: Number, required: true })(constructor.prototype, 'index');

    Field(() => String, {
      nullable: false,
      description: `${originalMetadata.entityDescription}'s label`,
    })(constructor.prototype, 'label');

    Prop({ type: String, required: true })(constructor.prototype, 'label');

    Field(() => Boolean, {
      nullable: false,
      description: `${originalMetadata.entityDescription}'s is selected by default ?`,
    })(constructor.prototype, 'isSelectedByDefault');

    Prop({ type: Boolean, required: true })(
      constructor.prototype,
      'isSelectedByDefault',
    );

    if (addChip) {
      Object.defineProperty(constructor.prototype, 'chip', {
        enumerable: true,
        configurable: true,
        writable: true,
      });

      Field(() => Chip, {
        nullable: false,
        description: `${originalMetadata.entityDescription}'s chip`,
      })(constructor.prototype, 'chip');

      Prop({ type: ChipSchemas.noIndex, required: true })(
        constructor.prototype,
        'chip',
      );
    }

    SimpleEntity({ isIdable: true })(constructor);

    const { entityToken } = EntityStore.get(constructor);

    const entityTokenDescription = entityToken.description;

    if (!entityTokenDescription) {
      throw new Error(
        'Description not found for token ' + entityToken.toString(),
      );
    }

    SetReferenceMetadata({
      referenceToken: entityToken,
      addChip,
    })(constructor);

    SetEntityMetadata({
      ...originalMetadata,
      EntityPartition: Partition,
      entityPartitioner: partitioner,
    })(constructor);

    if (!generateCollectionName) {
      throw new Error('generateCollectionName not found');
    }

    const collectionName = generateCollectionName(entityTokenDescription);

    Schema({ collection: collectionName })(constructor);

    ObjectType(entityTokenDescription, {
      description: originalMetadata.entityDescription,
    })(constructor);
  };
}

export interface ISimpleReference {
  _id: Id;
  code: string;
  version: number;
  index: number;
  label: string;
  isSelectedByDefault: boolean;
}
