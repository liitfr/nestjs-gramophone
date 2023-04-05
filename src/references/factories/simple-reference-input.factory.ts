import { Type } from '@nestjs/common';
import { Field, InputType } from '@nestjs/graphql';

import { getReferenceMetadata } from '../../utils/references/reference.util';
import { SimpleEntityInputFactory } from '../../utils/dtos/simple-entity-input.factory';

import { ChipInput } from '../dtos/chip.input';

// BUG : fix typing that is brut force casted to Partial<R>
export function SimpleReferenceInputFactory<
  R extends object & { chip?: string },
>(Reference: Type<R>): Type<Partial<R>> {
  const { referenceDescription, addChip } = getReferenceMetadata(Reference);

  if (addChip) {
    @InputType({ isAbstract: true })
    class MandatoryChipField {
      @Field(() => ChipInput, {
        description: `${referenceDescription}'s chip`,
        nullable: false,
      })
      readonly chip: ChipInput;
    }

    return SimpleEntityInputFactory(Reference, {
      removeFields: ['chip'],
      addFields: [MandatoryChipField],
    });
  }

  return SimpleEntityInputFactory(Reference);
}
