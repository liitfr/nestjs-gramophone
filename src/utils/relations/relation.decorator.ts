import { Prop } from '@nestjs/mongoose';
import { Field } from '@nestjs/graphql';
import { Schema as MongooseSchema } from 'mongoose';
import { Logger } from '@nestjs/common';

import {
  splitPascalWithSpaces,
  camelCase,
  lowerCaseFirstLetter,
  pascalCase,
  pluralize,
} from '../string.util';
import { IdScalar } from '../scalars/id.scalar';
import { EntityStore } from '../entities/entity-store.service';
import { SetEntityMetadata } from '../entities/set-entity-metadata.decorator';
import { SetEntityToken } from '../entities/set-entity-token.decorator';
import { EntityMetadata, getEntityToken } from '../entities/entity.util';

import {
  RelationDetails,
  RelationEntity,
  RelationOptions,
  defaultRelationOptions,
} from './relation.util';

export function Relation(
  relationTarget: RelationEntity,
  relationOptions?: RelationOptions,
) {
  return function (decoratorTarget: any, propertyKey: string) {
    let originalMetadata: Partial<EntityMetadata>;
    if (!getEntityToken(decoratorTarget.constructor)) {
      const token = Symbol(decoratorTarget.constructor.name);
      SetEntityToken(token)(decoratorTarget.constructor);
      SetEntityMetadata({
        entityToken: Symbol(decoratorTarget.constructor.name),
      })(decoratorTarget.constructor);
      originalMetadata = {
        entityToken: token,
        entityDescription: splitPascalWithSpaces(
          pascalCase(decoratorTarget.constructor.name),
        ),
      };
    } else {
      originalMetadata = EntityStore.get(decoratorTarget.constructor);
    }

    if (
      typeof relationTarget === 'string' &&
      relationTarget !== pascalCase(relationTarget)
    ) {
      throw new Error(
        `The relation target "${relationTarget}" is not a valid entity name. Please use PascalCase.`,
      );
    }

    const relationTargetMetadata = EntityStore.uncertainGet(relationTarget);

    const idSuffix = relationOptions?.multiple ? 'Ids' : 'Id';

    if (propertyKey !== camelCase(propertyKey)) {
      throw new Error(
        `The property "${propertyKey}" is not a valid property name. Please use camelCase.`,
      );
    }

    if (!propertyKey.endsWith(idSuffix)) {
      throw new Error(
        `The property "${propertyKey}" should end with "${idSuffix}".`,
      );
    }

    const resolvedName = propertyKey.replace(new RegExp(`${idSuffix}$`), '');

    const relationDescription =
      splitPascalWithSpaces(resolvedName).toLowerCase();

    if (relationOptions?.reversible && !relationOptions?.reversedIdName) {
      throw new Error(
        `The relation "${propertyKey}" is reversible but has no reversedIdName.`,
      );
    }

    if (relationOptions?.reversible) {
      Logger.warn(
        `
You are using a reversible relation. Please remember that :
- You should not use reversible relations between modules.
- If you use weak relations, you have to import your module's services before its resolvers in order to register all entity metadata first. If you don't do so, your target entity may not find any source entity in EntityStore.`,
        'RelationDecorator',
      );
    }

    if (relationOptions?.reversedIdName) {
      if (
        relationOptions?.reversedIdName !==
        camelCase(relationOptions?.reversedIdName)
      ) {
        throw new Error(
          `The reversedIdName "${relationOptions?.reversedIdName}" is not a valid property name. Please use camelCase.`,
        );
      }

      if (!relationOptions?.reversedIdName.endsWith('Ids')) {
        throw new Error(
          `The reversedIdName "${relationOptions?.reversedIdName}" should end with "Ids".`,
        );
      }
    }

    let reversedIdDescription: string | undefined = undefined;
    let reversedResolvedName: string | undefined = undefined;
    let reversedResolvedDescription: string | undefined = undefined;

    if (relationOptions?.reversedIdName) {
      const reversedBaseName = relationOptions?.reversedIdName?.replace(
        new RegExp('Ids$'),
        '',
      );

      reversedResolvedName = pluralize(reversedBaseName);

      const reversedRelationIdDescription =
        splitPascalWithSpaces(reversedBaseName).toLowerCase();
      const reversedRelationResolvedDescription = splitPascalWithSpaces(
        pluralize(reversedBaseName),
      ).toLowerCase();

      const targetDescription =
        typeof relationTarget === 'string'
          ? splitPascalWithSpaces(relationTarget)
          : relationTargetMetadata?.entityDescription ?? relationTarget.name;

      reversedIdDescription = `${targetDescription}'s ${reversedRelationIdDescription} ids`;
      reversedResolvedDescription = `${targetDescription}'s ${reversedRelationResolvedDescription}`;
    }

    const relationDetails: RelationDetails = {
      ...defaultRelationOptions,
      idName: propertyKey,
      idDescription: `${
        originalMetadata.entityDescription
      }'s ${relationDescription} ${lowerCaseFirstLetter(idSuffix)}`,
      resolvedName,
      resolvedDescription: `${originalMetadata.entityDescription}'s ${relationDescription}`,
      reversedIdDescription,
      reversedResolvedName,
      reversedResolvedDescription,
      ...relationOptions,
    };

    const targetRef =
      typeof relationTarget === 'string'
        ? relationTarget
        : relationTargetMetadata?.entityToken?.description ??
          relationTarget.name;

    Prop({
      type: relationOptions?.multiple
        ? [MongooseSchema.Types.ObjectId]
        : MongooseSchema.Types.ObjectId,
      ref: targetRef,
      autopopulate: false,
      required: !relationOptions?.nullable,
    })(decoratorTarget, propertyKey);

    Field(() => (relationOptions?.multiple ? [IdScalar] : IdScalar), {
      name: propertyKey,
      nullable: relationOptions?.nullable,
      description: relationDetails.idDescription,
    })(decoratorTarget, propertyKey);

    SetEntityMetadata({
      ...originalMetadata,
      entityRelations: [
        ...(originalMetadata.entityRelations || []),
        { target: relationTarget, details: relationDetails },
      ],
    })(decoratorTarget.constructor);
  };
}
