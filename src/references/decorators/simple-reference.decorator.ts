import { SetMetadata } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

import {
  ENTITY_METADATA,
  EntityMetadata,
  getEntityMetadata,
} from '../../utils/entities/entity.util';
import { SimpleEntity } from '../../utils/entities/simple-entity.decorator';
import {
  REFERENCE_METADATA,
  ReferenceMetadata,
} from '../../utils/references/reference.util';
import {
  generateCollectionName,
  pascalCase,
  pluralize,
} from '../../utils/string.util';
import { Id } from '../../utils/id.type';

import { Chip, ChipSchemas } from '../entities/chip.entity';

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

    const entityToken = Symbol(constructor.name);

    const entityServiceToken = Symbol(
      `${pluralize(pascalCase(entityToken.description))}Service`,
    );

    const entityRepositoryToken = Symbol(
      `${pluralize(pascalCase(entityToken.description))}Repository`,
    );

    SetMetadata<symbol, EntityMetadata>(ENTITY_METADATA, {
      ...entityMetadata,
      entityToken,
      entityDescription,
      EntityPartition: Partition,
      entityPartitioner: partitioner,
      entityServiceToken,
      entityRepositoryToken,
    })(constructor);

    SetMetadata<symbol, ReferenceMetadata>(REFERENCE_METADATA, {
      addChip,
    })(constructor);

    SimpleEntity({ isIdable: true })(constructor);

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
