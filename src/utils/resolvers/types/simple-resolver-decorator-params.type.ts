import { Type } from '@nestjs/common';

import { EntityRelation } from '../../../data/utils/relation.util';

import { ResolverOptions } from './options.type';
import { PartialSimpleApiInput, SimpleApiInput } from './simple-api-input.type';

export type SimpleResolverDecoratorParams<E extends object> = {
  Entity: Type<E>;
  options: ResolverOptions<E>;
  Input: SimpleApiInput<E>;
  PartialInput: PartialSimpleApiInput<E>;
  entityDescription: string;
  entityToken: symbol;
  entityTokenDescription: string;
  isTrackable: boolean;
  entityRelations: readonly EntityRelation[];
  hasRelations: boolean;
};
