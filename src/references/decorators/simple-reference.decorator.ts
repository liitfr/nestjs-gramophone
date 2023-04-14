import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

import { getEntityMetadata } from '../../utils/entities/entity.util';
import { SimpleEntity } from '../../utils/entities/simple-entity.decorator';
import { generateCollectionName } from '../../utils/string.util';
import { Id } from '../../utils/id.type';
import { SetEntityMetadata } from '../../utils/entities/set-entity-metadata.decorator';

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
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const entityMetadata = getEntityMetadata(constructor);
    const { entityDescription } = entityMetadata;

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
      description: `${entityDescription}'s ${partitionerDescription}`,
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
      description: `${entityDescription}'s version`,
    })(constructor.prototype, 'version');

    Prop({ type: Number, required: true })(constructor.prototype, 'version');

    Field(() => Int, {
      nullable: false,
      description: `${entityDescription}'s index`,
    })(constructor.prototype, 'index');

    Prop({ type: Number, required: true })(constructor.prototype, 'index');

    Field(() => String, {
      nullable: false,
      description: `${entityDescription}'s label`,
    })(constructor.prototype, 'label');

    Prop({ type: String, required: true })(constructor.prototype, 'label');

    Field(() => Boolean, {
      nullable: false,
      description: `${entityDescription}'s is selected by default ?`,
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
        description: `${entityDescription}'s chip`,
      })(constructor.prototype, 'chip');

      Prop({ type: ChipSchemas.noIndex, required: true })(
        constructor.prototype,
        'chip',
      );
    }

    SimpleEntity({ isIdable: true })(constructor);

    const { entityToken } = getEntityMetadata(constructor);

    SetReferenceMetadata({
      referenceToken: entityToken,
      addChip,
    })(constructor);

    SetEntityMetadata({
      entityToken,
      entityDescription,
      EntityPartition: Partition,
      entityPartitioner: partitioner,
    })(constructor);

    Schema({ collection: generateCollectionName(entityToken.description) })(
      constructor,
    );

    ObjectType(entityToken.description, { description: entityDescription })(
      constructor,
    );
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
