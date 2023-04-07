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
import { lowerCaseFirstLetter } from '../string.util';

const defaultOptions = {
  nullable: false,
  resolve: true,
  partitionQueries: false,
};

type Input = (Type<unknown> | EntityRelation)[];

interface CreatePropInput {
  Relation: Type<unknown>;
  options: Omit<EntityRelation, 'Relation'>;
  entityDescription: string;
}

function createProp({ Relation, options, entityDescription }: CreatePropInput) {
  const { entityToken: relationToken, entityDescription: relationDescription } =
    getEntityMetadata(Relation);

  const { nullable = false, idName } = { ...defaultOptions, ...options };

  const relationIdPropName = lowerCaseFirstLetter(
    idName ?? `${relationToken.description}Id`,
  );

  if (!this.hasOwnProperty(relationIdPropName)) {
    Object.defineProperty(this, relationIdPropName, {
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: relationToken.description,
    autopopulate: false,
    required: !nullable,
  })(this, relationIdPropName);

  Field(() => IdScalar, {
    name: relationIdPropName,
    nullable: nullable ?? true,
    description: `${entityDescription}'s ${lowerCaseFirstLetter(
      relationDescription,
    )} id`,
  })(this, relationIdPropName);
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
          idDescription: relationDescription,
          resolvedDescription: relationDescription,
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
          idName: lowerCaseFirstLetter(`${relationToken.description}Id`),
          resolvedName: lowerCaseFirstLetter(relationToken.description),
          idDescription: relationDescription,
          resolvedDescription: relationDescription,
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
