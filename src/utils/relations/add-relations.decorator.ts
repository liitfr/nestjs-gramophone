import { SetMetadata, Type } from '@nestjs/common';
import { Field } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import {
  ENTITY_METADATA,
  EntityMetadata,
  EntityRelation,
  getEntityMetadata,
} from '../entities/entity.util';
import { IdScalar } from '../scalars/id.scalar';
import { lowerCaseFirstLetter, pluralize } from '../string.util';

const defaultOptions = {
  nullable: false,
  resolve: true,
  partitionQueries: false,
  multiple: false,
};

type Input = (Type<unknown> | EntityRelation)[];

interface CreatePropInput {
  Relation: Type<unknown>;
  options: Omit<EntityRelation, 'Relation'>;
  entityDescription: string;
}

function createProp({ Relation, options }: CreatePropInput) {
  const { entityToken: relationToken } = getEntityMetadata(Relation);

  const { nullable, idName, idDescription, multiple } = {
    ...defaultOptions,
    ...options,
  };

  if (!this.hasOwnProperty(idName)) {
    Object.defineProperty(this, idName, {
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  Prop({
    type: multiple
      ? [MongooseSchema.Types.ObjectId]
      : MongooseSchema.Types.ObjectId,
    ref: relationToken.description,
    autopopulate: false,
    required: !nullable,
  })(this, idName);

  Field(() => (multiple ? [IdScalar] : IdScalar), {
    name: idName,
    nullable: nullable ?? true,
    description: idDescription,
  })(this, idName);
}

export function AddRelations(inputs: Input) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const originalMetadata = getEntityMetadata(constructor);

    const { entityDescription } = originalMetadata;

    const entityRelationsMetadata: EntityRelation[] = [];

    inputs.forEach((input) => {
      if (typeof input === 'function') {
        const Relation = input as Type<unknown>;
        const {
          entityToken: relationToken,
          entityDescription: relationDescription,
        } = getEntityMetadata(Relation);
        const options = {
          ...defaultOptions,
          idName: lowerCaseFirstLetter(`${relationToken.description}Id`),
          resolvedName: lowerCaseFirstLetter(relationToken.description),
          idDescription: `${entityDescription}'s ${lowerCaseFirstLetter(
            relationDescription,
          )} id`,
          resolvedDescription: `${entityDescription}'s ${lowerCaseFirstLetter(
            relationDescription,
          )}`,
        };
        createProp.call(constructor.prototype, {
          Relation,
          options,
          entityDescription,
        });
        entityRelationsMetadata.push({
          Relation,
          ...options,
        });
      } else {
        const { Relation, ...otherOptions } = input as EntityRelation;
        const {
          entityToken: relationToken,
          entityDescription: relationDescription,
        } = getEntityMetadata(Relation);
        const options = {
          ...defaultOptions,
          idName:
            input.idName ??
            lowerCaseFirstLetter(
              `${relationToken.description}Id${input.multiple ? 's' : ''}`,
            ),
          resolvedName:
            input.resolvedName ??
            lowerCaseFirstLetter(
              input.multiple
                ? pluralize(`${relationToken.description}`)
                : `${relationToken.description}`,
            ),
          idDescription:
            input.idDescription ??
            `${entityDescription}'s ${lowerCaseFirstLetter(
              relationDescription,
            )} id${input.multiple ? 's' : ''}`,
          resolvedDescription:
            input.resolvedDescription ??
            `${entityDescription}'s ${lowerCaseFirstLetter(
              input.multiple
                ? pluralize(relationDescription)
                : relationDescription,
            )}`,
          ...otherOptions,
        };
        createProp.call(constructor.prototype, {
          Relation,
          options,
          entityDescription,
        });
        entityRelationsMetadata.push({ Relation, ...options });
      }
    });

    SetMetadata<symbol, EntityMetadata>(ENTITY_METADATA, {
      ...originalMetadata,
      entityRelations: [
        ...(originalMetadata.entityRelations || []),
        ...entityRelationsMetadata,
      ],
    })(constructor);
  };
}
