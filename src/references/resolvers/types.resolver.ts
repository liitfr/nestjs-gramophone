import { Resolver } from '@nestjs/graphql';

import { SimpleResolverFactory } from '../../utils/resolvers/simple-resolver.factory';

import { Type, TypeDocument } from '../models/type.model';
import { TypesService } from '../services/types.service';
import { TypeInput } from '../dtos/type.input';

const SimpleTypeResolver = SimpleResolverFactory(Type, TypeInput, {
  noMutation: true,
});

@Resolver(() => Type)
export class TypesResolver extends SimpleTypeResolver<TypeDocument> {
  constructor(simpleService: TypesService, private typesService: TypesService) {
    super(simpleService);
  }
}
