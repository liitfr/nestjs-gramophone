import { Resolver } from '@nestjs/graphql';

import { SimpleResolverFactory } from '../../../utils/resolvers/simple-resolver.factory';
import { resolverDescription } from '../../../utils/resolvers/resolver.util';

import { Type, TypeDocument } from '../models/type.model';
import { TypesService } from '../services/types.service';
import { TypeInput } from '../dto/type.input';

const SimpleTypeResolver = SimpleResolverFactory(Type, TypeInput, {
  noMutation: true,
});

@Resolver(() => Type)
export class TypesResolver extends SimpleTypeResolver<TypeDocument> {
  constructor(simpleService: TypesService, private typesService: TypesService) {
    super(simpleService);
  }

  static [resolverDescription]: 'Types Resolver';
}
