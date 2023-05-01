import { Type } from '@nestjs/common';

import { ResolverOptions } from '../../utils/resolvers/types/options.type';
import { ReversedRelationMetadata } from '../../utils/entities/entity-store.service';

export type ReversedRelationResolverDecoratorParams<E extends object> = {
  Target: Type<E>;
  options: ResolverOptions<E>;
  reversedRelationsMetadata: ReversedRelationMetadata[];
  targetToken: symbol;
  targetTokenDescription: string;
};
