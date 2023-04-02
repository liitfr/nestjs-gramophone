import { SetMetadata, Type } from '@nestjs/common';
import { Field } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import {
  ENTITY_METADATA,
  EntityMetadata,
  EntityReference,
  getEntityMetadata,
} from '../../utils/entities/entity.util';
import { IdScalar } from '../../utils/scalars/id.scalar';
import { lowerCaseFirstLetter } from '../../utils/string.util';

const defaultOptions = {
  nullable: false,
  resolve: true,
  partitionQueries: false,
};

type Input = (Type<unknown> | EntityReference)[];

interface CreatePropInput {
  Reference: Type<unknown>;
  options: Omit<EntityReference, 'Reference'>;
  entityDescription: string;
}

function createProp({
  Reference,
  options,
  entityDescription,
}: CreatePropInput) {
  const { entityName: referenceName, entityDescription: referenceDescription } =
    getEntityMetadata(Reference);

  const { nullable = false, idName } = { ...defaultOptions, ...options };

  const referenceIdPropName = lowerCaseFirstLetter(
    idName ?? `${referenceName}Id`,
  );

  if (!this.hasOwnProperty(referenceIdPropName)) {
    Object.defineProperty(this, referenceIdPropName, {
      writable: true,
      enumerable: true,
    });
  }

  Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: referenceName,
    autopopulate: false,
    required: !nullable,
  })(this, referenceIdPropName);

  Field(() => IdScalar, {
    name: referenceIdPropName,
    nullable: nullable ?? true,
    description: `${entityDescription}'s ${lowerCaseFirstLetter(
      referenceDescription,
    )} id`,
  })(this, referenceIdPropName);
}

export function AddReferences(inputs: Input) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const originalMetadata = getEntityMetadata(constructor);

    const { entityDescription } = originalMetadata;

    const entityReferencesMetadata = [];

    inputs.forEach((input) => {
      if (typeof input === 'function') {
        const Reference = input as Type<unknown>;
        createProp.call(constructor.prototype, {
          Reference,
          options: defaultOptions,
          entityDescription,
        });
        entityReferencesMetadata.push({ Reference, ...defaultOptions });
      } else {
        const options = input as EntityReference;
        const { Reference, ...otherOptions } = options;
        createProp.call(constructor.prototype, {
          Reference,
          options: { ...defaultOptions, ...otherOptions },
          entityDescription,
        });
        entityReferencesMetadata.push(options);
      }
    });

    SetMetadata<symbol, EntityMetadata>(ENTITY_METADATA, {
      ...originalMetadata,
      entityReferences: [
        ...(originalMetadata.entityReferences || []),
        ...entityReferencesMetadata,
      ],
    });
  };
}
