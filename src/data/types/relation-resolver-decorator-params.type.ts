import { Type } from '@nestjs/common';

import { ResolverOptions } from '../../utils/resolvers/types/options.type';
import { RelationMetadata } from '../../utils/entities/entity-store.service';

export type RelationResolverDecoratorParams<E extends object> = {
  Source: Type<E>;
  options: ResolverOptions<E>;
  relationsMetadata: RelationMetadata[];
  sourceToken: symbol;
  sourceTokenDescription: string;
};
