import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

import { SimpleEntity } from '../../utils/entities/simple-entity.decorator';
import { generateCollectionName } from '../../utils/string.util';
import { Id } from '../../utils/types/id.type';
import { EntityStore } from '../../utils/entities/entity-store.service';
import { SetEntityMetadata } from '../../utils/entities/set-entity-metadata.decorator';
import { initEntityMetadata } from '../../utils/entities/entity.util';
import { Constructor } from '../../utils/types/constructor.type';
import { Nested } from '../../data/decorators/nested.decorator';

import { Chip } from '../entities/chip.entity';
import { initReferenceMetadata } from '../utils/reference.util';

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
  return <T extends Constructor>(constructor: T) => {
    const defaultToken = Symbol(constructor.name);

    const originalEntityMetadata = initEntityMetadata(
      constructor,
      defaultToken,
    );
    initReferenceMetadata(constructor, defaultToken);

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
      description: `${originalEntityMetadata.entityDescription}'s ${partitionerDescription}`,
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
      description: `${originalEntityMetadata.entityDescription}'s version`,
    })(constructor.prototype, 'version');

    Prop({ type: Number, required: true })(constructor.prototype, 'version');

    Field(() => Int, {
      nullable: false,
      description: `${originalEntityMetadata.entityDescription}'s index`,
    })(constructor.prototype, 'index');

    Prop({ type: Number, required: true })(constructor.prototype, 'index');

    Field(() => String, {
      nullable: false,
      description: `${originalEntityMetadata.entityDescription}'s label`,
    })(constructor.prototype, 'label');

    Prop({ type: String, required: true })(constructor.prototype, 'label');

    Field(() => Boolean, {
      nullable: false,
      description: `${originalEntityMetadata.entityDescription}'s is selected by default ?`,
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

      Nested(Chip, {
        nullable: false,
        description: `${originalEntityMetadata.entityDescription}'s chip`,
      })(constructor.prototype, 'chip');
    }

    SimpleEntity({ isIdable: true })(constructor);

    const { entityToken } = EntityStore.get(constructor);

    const entityTokenDescription = entityToken.description;

    if (!entityTokenDescription) {
      throw new Error(
        `Description not found for token ${entityToken.toString()}`,
      );
    }

    SetReferenceMetadata({
      referenceToken: entityToken,
      addChip,
    })(constructor);

    SetEntityMetadata({
      ...originalEntityMetadata,
      EntityPartition: Partition,
      entityPartitioner: partitioner,
    })(constructor);

    if (!generateCollectionName) {
      throw new Error('generateCollectionName not found');
    }

    const collectionName = generateCollectionName(entityTokenDescription);

    Schema({ collection: collectionName })(constructor);

    ObjectType(entityTokenDescription, {
      description: originalEntityMetadata.entityDescription,
    })(constructor);
  };
}

// BUG : chip is not uncertain but depends on addChip option
export interface ISimpleReference {
  _id: Id;
  code: string;
  version: number;
  index: number;
  label: string;
  isSelectedByDefault: boolean;
  chip?: Chip;
}
