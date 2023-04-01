import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { SimpleResolverFactory } from '../../utils/resolvers/simple-resolver.factory';
import { resolverDescription } from '../../utils/resolvers/resolver.util';

import { Author, AuthorDocument } from '../models/author.model';
import { Post } from '../models/post.model';
import { AuthorInput } from '../dto/author.input';
import { AuthorsService } from '../services/authors.service';
import { PostsService } from '../services/posts.service';

const SimpleAuthorResolver = SimpleResolverFactory(Author, AuthorInput);

@Resolver(() => Author)
export class AuthorsResolver extends SimpleAuthorResolver<AuthorDocument> {
  constructor(
    simpleService: AuthorsService,
    private postsService: PostsService,
  ) {
    super(simpleService);
  }

  static [resolverDescription]: 'Authors Resolver';

  @ResolveField(() => [Post], { name: 'posts' })
  async posts(@Parent() author: Author) {
    const { _id } = author;
    return this.postsService.findAllPostsForOneAuthor(_id);
  }
}
