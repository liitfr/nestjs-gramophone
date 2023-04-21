import { Type } from '@nestjs/common';
import { Field, InputType } from '@nestjs/graphql';

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

export function SimpleReferenceInputFactory<R extends ISimpleReference>(
  Reference: Type<R>,
  options?: SimpleEntityInputFactoryOptions<R>,
): SimpleInput<R> {
  const reference = ReferenceStore.uncertainGet(Reference);

  if (reference?.addChip) {
    const { entityDescription } = EntityStore.get(Reference);

    @InputType({ isAbstract: true })
    class MandatoryChipField {
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
      addFields: [...(options?.addFields ?? []), MandatoryChipField],
    });
  }

  return SimpleEntityInputFactory(Reference, options);
}
