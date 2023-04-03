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
import { getReferenceMetadata } from '../../utils/references/reference.util';

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
  const { referenceName, referenceDescription } =
    getReferenceMetadata(Reference);

  const { nullable = false, idName } = { ...defaultOptions, ...options };

  const referenceIdPropName = lowerCaseFirstLetter(
    idName ?? `${referenceName}Id`,
  );

  if (!this.hasOwnProperty(referenceIdPropName)) {
    Object.defineProperty(this, referenceIdPropName, {
      writable: true,
      enumerable: true,
      configurable: true,
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

    const entityReferencesMetadata: EntityReference[] = [];

    inputs.forEach((input) => {
      if (typeof input === 'function') {
        const Reference = input as Type<unknown>;
        const { referenceName, referenceDescription } =
          getReferenceMetadata(Reference);
        const options = {
          ...defaultOptions,
          idName: lowerCaseFirstLetter(`${referenceName}Id`),
          resolvedName: lowerCaseFirstLetter(referenceName),
          idDescription: referenceDescription,
          resolvedDescription: referenceDescription,
        };
        createProp.call(constructor.prototype, {
          Reference,
          options,
          entityDescription,
        });
        entityReferencesMetadata.push({
          Reference,
          ...options,
        });
      } else {
        const { Reference, ...otherOptions } = input as EntityReference;
        const { referenceName, referenceDescription } =
          getReferenceMetadata(Reference);
        const options = {
          ...defaultOptions,
          idName: lowerCaseFirstLetter(`${referenceName}Id`),
          resolvedName: lowerCaseFirstLetter(referenceName),
          idDescription: referenceDescription,
          resolvedDescription: referenceDescription,
          ...otherOptions,
        };
        createProp.call(constructor.prototype, {
          Reference,
          options,
          entityDescription,
        });
        entityReferencesMetadata.push({ Reference, ...options });
      }
    });

    SetMetadata<symbol, EntityMetadata>(ENTITY_METADATA, {
      ...originalMetadata,
      entityReferences: [
        ...(originalMetadata.entityReferences || []),
        ...entityReferencesMetadata,
      ],
    })(constructor);
  };
}
