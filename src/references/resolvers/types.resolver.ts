import { SimpleResolverFactory } from '../../utils/resolvers/simple-resolver.factory';

import { Type } from '../models/type.model';
import { TypesService } from '../services/types.service';
import { TypeInput } from '../dtos/type.input';

export const TypesResolver = SimpleResolverFactory(
  Type,
  TypeInput,
  TypesService,
  {
    noMutation: true,
  },
);
