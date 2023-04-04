import { SetMetadata } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

import {
  ENTITY_METADATA,
  EntityMetadata,
} from '../../utils/entities/entity.util';
import { SimpleEntity } from '../../utils/entities/simple-entity.decorator';
import {
  REFERENCE_METADATA,
  ReferenceMetadata,
  getReferenceMetadata,
} from '../../utils/references/reference.util';
import { generateCollectionName } from '../../utils/string.util';

export function SimpleReference(ReferencePartitioner: Record<string, string>) {
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const { referenceName, referenceDescription } =
      getReferenceMetadata(constructor);

    Object.defineProperties(constructor.prototype, {
      code: { enumerable: true, configurable: true, writable: true },
      version: { enumerable: true, configurable: true, writable: true },
      index: { enumerable: true, configurable: true, writable: true },
      label: { enumerable: true, configurable: true, writable: true },
      isSelectedByDefault: {
        enumerable: true,
        configurable: true,
        writable: true,
      },
    });

    Field(() => ReferencePartitioner, {
      nullable: false,
      description: `${referenceDescription}'s code`,
    })(constructor.prototype, 'code');

    Prop({
      type: String,
      required: true,
      enum: ReferencePartitioner,
      unique: true,
      index: true,
    })(constructor.prototype, 'code');

    Field(() => Int, {
      nullable: false,
      description: `${referenceDescription}'s version`,
    })(constructor.prototype, 'version');

    Prop({ type: Number, required: true })(constructor.prototype, 'version');

    Field(() => Int, {
      nullable: false,
      description: `${referenceDescription}'s index`,
    })(constructor.prototype, 'index');

    Prop({ type: Number, required: true })(constructor.prototype, 'index');

    Field(() => String, {
      nullable: false,
      description: `${referenceDescription}'s label`,
    })(constructor.prototype, 'label');

    Prop({ type: String, required: true })(constructor.prototype, 'label');

    Field(() => Boolean, {
      nullable: false,
      description: `${referenceDescription}'s is selected by default ?`,
    })(constructor.prototype, 'isSelectedByDefault');

    Prop({ type: Boolean, required: true })(
      constructor.prototype,
      'isSelectedByDefault',
    );

    SetMetadata<symbol, EntityMetadata>(ENTITY_METADATA, {
      entityName: referenceName,
      entityDescription: referenceDescription,
    })(constructor);

    SetMetadata<symbol, ReferenceMetadata>(REFERENCE_METADATA, {
      referenceName,
      referenceDescription,
      ReferencePartitioner,
    })(constructor);

    SimpleEntity({ isIdable: true })(constructor);

    Schema({ collection: generateCollectionName(referenceName) })(constructor);

    ObjectType(referenceName, { description: referenceDescription })(
      constructor,
    );
  };
}

export interface ISimpleReference {
  code: string;
  version: number;
  index: number;
  label: string;
  isSelectedByDefault: boolean;
}
