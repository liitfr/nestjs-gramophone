import { Resolver } from '@nestjs/graphql';

import { SimpleResolverFactory } from 'src/utils/resolvers/factories/simple-resolver.factory';

import { Author } from '../entities/author.entity';
import { AuthorInput } from '../dtos/author.input';
import { AuthorsService } from '../services/authors.service';

const SimpleAuthorResolver = SimpleResolverFactory(
  Author,
  AuthorInput,
  AuthorsService,
);

@Resolver(() => Author)
export class AuthorsResolver extends SimpleAuthorResolver {}
