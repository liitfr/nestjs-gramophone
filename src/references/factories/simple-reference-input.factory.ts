import { Type } from '@nestjs/common';
import { Field, InputType } from '@nestjs/graphql';
import { O } from 'ts-toolbelt';
import { If } from 'ts-toolbelt/out/Any/If'; // https://github.com/millsp/ts-toolbelt/issues/293

import {
  SimpleEntityInputFactory,
  SimpleEntityInputFactoryOptions,
  SimpleInput,
} from '../../utils/dtos/simple-entity-input.factory';
import { EntityStore } from '../../utils/entities/entity-store.service';
import { pascalCase, splitPascalWithSpaces } from '../../utils/string.util';

import { ChipInput } from '../dtos/chip.input';
import { ReferenceStore } from '../services/reference-store.service';
import { ISimpleReference } from '../decorators/simple-reference.decorator';

export interface IMandatoryChipField {
  chip: ChipInput;
}

type ReferenceInput<
  TEntity extends ISimpleReference,
  TRemove extends readonly (keyof TEntity)[] = [],
  TAdd extends Array<Type> = [],
> = If<
  O.Has<TEntity, 'chip', any, 'contains->'>,
  SimpleInput<
    TEntity,
    [...TRemove, 'chip'],
    [...TAdd, Type<IMandatoryChipField>]
  >,
  SimpleInput<TEntity, TRemove, TAdd>
>;

export function SimpleReferenceInputFactory<
  TEntity extends ISimpleReference,
  TRemove extends readonly (keyof TEntity)[] = [],
  TAdd extends Array<Type> = [],
>(
  Reference: Type<TEntity>,
  options?: SimpleEntityInputFactoryOptions<TEntity, TRemove, TAdd>,
): ReferenceInput<TEntity, TRemove, TAdd> {
  const reference = ReferenceStore.uncertainGet(Reference);

  if (reference?.addChip) {
    const { entityDescription } = EntityStore.get(Reference);

    @InputType({ isAbstract: true })
    class MandatoryChipField implements IMandatoryChipField {
      @Field(() => ChipInput, {
        description: `${
          entityDescription ?? splitPascalWithSpaces(pascalCase(Reference.name))
        }'s chip`,
        nullable: false,
      })
      readonly chip: ChipInput;
    }

    return SimpleEntityInputFactory(Reference, {
      ...(options ?? {}),
      removeFields: [...(options?.removeFields ?? []), 'chip'],
      AddFields: [...(options?.AddFields ?? []), MandatoryChipField],
    }) as ReferenceInput<TEntity, TRemove, TAdd>;
  }

  return SimpleEntityInputFactory(Reference, options) as ReferenceInput<
    TEntity,
    TRemove,
    TAdd
  >;
}
