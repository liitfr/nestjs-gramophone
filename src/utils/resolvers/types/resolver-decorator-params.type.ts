import { Type } from '@nestjs/common';

import { SimpleInput } from '../../dtos/simple-entity-input.factory';
import { EntityRelation } from '../../entities/entity.util';

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
