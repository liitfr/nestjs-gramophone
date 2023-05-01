import { Prop } from '@nestjs/mongoose';
import { Field } from '@nestjs/graphql';
import { Schema as MongooseSchema } from 'mongoose';

import {
  splitPascalWithSpaces,
  camelCase,
  lowerCaseFirstLetter,
  pascalCase,
  pluralize,
} from '../../utils/string.util';
import { IdScalar } from '../../utils/scalars/id.scalar';
import { EntityStore } from '../../utils/entities/entity-store.service';
import { SetEntityMetadata } from '../../utils/entities/set-entity-metadata.decorator';
import { initEntityMetadata } from '../../utils/entities/entity.util';
import { STHandle } from '../../utils/types/handle.type';

import {
  RelationDetails,
  RelationOptions,
  defaultRelationOptions,
} from '../utils/relation.util';

export function Relation<T extends object>(
  relationTarget: STHandle<T>,
  relationOptions?: RelationOptions,
) {
  return function (decoratorTarget: any, propertyKey: string) {
    const originalMetadata = initEntityMetadata(decoratorTarget.constructor);

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
