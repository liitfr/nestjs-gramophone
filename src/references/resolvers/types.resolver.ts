import { Type } from '../models/type.model';
import { TypesService } from '../services/types.service';
import { TypeInput } from '../dtos/type.input';

import { SimpleReferenceResolverFactory } from './simple-reference-resolver.factory';

export const TypesResolver = SimpleReferenceResolverFactory(
  Type,
  TypeInput,
  TypesService,
);
