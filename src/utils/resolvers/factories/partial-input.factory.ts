import { InputType, PartialType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

import {
  PartialSimpleApiInput,
  SimpleApiInput,
} from '../types/simple-api-input.type';

export function PartialInputFactory<E extends object>(
  Input: SimpleApiInput<E>,
  entityTokenDescription: string,
): PartialSimpleApiInput<E> {
  @InputType(`${entityTokenDescription}PartialInput`)
  // HACK: why do I have to cast to Type ?
  class PartialInput extends PartialType(Input as Type) {}

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface PartialInput extends PartialSimpleApiInput<E> {}

  return PartialInput as PartialSimpleApiInput<E>;
}
