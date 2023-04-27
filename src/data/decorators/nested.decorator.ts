import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Field } from '@nestjs/graphql';

import { camelCase, splitPascalWithSpaces } from '../../utils/string.util';
import { EntityStore } from '../../utils/entities/entity-store.service';
import { SetEntityMetadata } from '../../utils/entities/set-entity-metadata.decorator';
import { initEntityMetadata } from '../../utils/entities/entity.util';
import { THandle } from '../../utils/types/handle.type';

import {
  NestedDetails,
  NestedOptions,
  defaultNestedOptions,
} from '../utils/nested.util';

export function Nested<T extends object>(
  NestedTarget: THandle<T>,
  nestedOptions?: NestedOptions,
) {
  return function (decoratorTarget: any, propertyKey: string) {
    const originalMetadata = initEntityMetadata(decoratorTarget.constructor);

    let nestedTargetMetadata = EntityStore.get(NestedTarget);

    if (!nestedTargetMetadata.entitySchema) {
      const nestedTargetSchema = SchemaFactory.createForClass(NestedTarget);

      SetEntityMetadata({
        ...nestedTargetMetadata,
        entitySchema: nestedTargetSchema,
      })(NestedTarget);

      nestedTargetMetadata = EntityStore.get(NestedTarget);
    }

    if (propertyKey !== camelCase(propertyKey)) {
      throw new Error(
        `The nested entity "${propertyKey}" hasn't a valid property name. Please use camelCase.`,
      );
    }

    if (propertyKey.endsWith('Ids') || propertyKey.endsWith('Id')) {
      throw new Error(
        `The nested entity "${propertyKey}" property name should not end with "Id" or "Ids".`,
      );
    }

    const nestedDescription = splitPascalWithSpaces(propertyKey).toLowerCase();

    const nestedDetails: NestedDetails = {
      ...defaultNestedOptions,
      name: propertyKey,
      description: `${originalMetadata.entityDescription}'s ${nestedDescription}`,
      ...nestedOptions,
    };

    Prop({
      type: nestedOptions?.multiple
        ? [nestedTargetMetadata.entitySchema]
        : nestedTargetMetadata.entitySchema,
      required: !nestedOptions?.nullable,
    })(decoratorTarget, propertyKey);

    Field(() => (nestedOptions?.multiple ? [NestedTarget] : NestedTarget), {
      name: propertyKey,
      nullable: nestedOptions?.nullable,
      description: nestedDetails.description,
    })(decoratorTarget, propertyKey);

    SetEntityMetadata({
      ...originalMetadata,
      nestedEntities: [
        ...(originalMetadata.nestedEntities || []),
        { target: NestedTarget, details: nestedDetails },
      ],
    })(decoratorTarget.constructor);
  };
}
