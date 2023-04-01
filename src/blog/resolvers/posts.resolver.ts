import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { SimpleResolverFactory } from '../../utils/resolvers/simple-resolver.factory';

import { Author } from '../models/author.model';
import { Post, PostDocument } from '../models/post.model';
import { AuthorsService } from '../services/authors.service';
import { PostsService } from '../services/posts.service';
import { PostInput } from '../dto/post.input';

const SimplePostResolver = SimpleResolverFactory(Post, PostInput);

@Resolver(() => Post)
export class PostsResolver extends SimplePostResolver<PostDocument> {
  constructor(
    simpleService: PostsService,
    private authorsService: AuthorsService,
  ) {
    super(simpleService);
  }

  @ResolveField(() => Author, { name: 'author' })
  async author(@Parent() post: Post) {
    const { authorId } = post;
    return this.authorsService.findById(authorId);
  }
}
