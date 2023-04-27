import { Type } from '@nestjs/common';

import { EntityRelation } from '../../../data/utils/relation.util';

import { SimpleInput } from '../../dtos/simple-entity-input.factory';

import { Options } from './options.type';

export type ResolverDecoratorParams<E extends object> = {
  Entity: Type<E>;
  options: Options<E>;
  Input: Type<unknown>;
  PartialInput: SimpleInput<unknown>;
  entityDescription: string;
  entityToken: symbol;
  entityTokenDescription: string;
  isTrackable: boolean;
  entityRelations: EntityRelation[];
  hasRelations: boolean;
};
