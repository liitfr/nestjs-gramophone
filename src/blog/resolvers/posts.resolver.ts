import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { SimpleResolverFactory } from '../../utils/resolvers/simple-resolver.factory';

import { Author } from '../models/author.model';
import { Post } from '../models/post.model';
import { PostsService } from '../services/posts.service';
import { PostInput } from '../dtos/post.input';
import { AuthorsService } from '../services/authors.service';

const SimplePostResolver = SimpleResolverFactory(Post, PostInput, PostsService);

@Resolver(() => Post)
export class PostsResolver extends SimplePostResolver {
  constructor(private readonly authorsService: AuthorsService) {
    super();
  }

  @ResolveField(() => Author, { name: 'author' })
  async author(@Parent() post: Post) {
    const { authorId } = post;
    return this.authorsService.findById(authorId);
  }
}
