import { Parent, ResolveField, Resolver, Query, Args } from '@nestjs/graphql';

import { SimpleResolverFactory } from '../../utils/resolvers/simple-resolver.factory';
import { Id } from '../../utils/id.type';
import { IdScalar } from '../../utils/scalars/id.scalar';

import { Author } from '../entities/author.entity';
import { Post } from '../entities/post.entity';
import { PostsService } from '../services/posts.service';
import { PostInput } from '../dtos/post.input';
import { AuthorsService } from '../services/authors.service';

const SimplePostResolver = SimpleResolverFactory(Post, PostInput, PostsService);

@Resolver(() => Post)
export class PostsResolver extends SimplePostResolver {
  constructor(private readonly authorsService: AuthorsService) {
    super();
  }

  @ResolveField(() => Author, { name: 'author', description: "Post's author" })
  async author(@Parent() post: Post) {
    const { authorId } = post;
    return this.authorsService.findById(authorId);
  }

  @Query(() => [Post], {
    name: 'findAllPostsForOneAuthor',
    description: 'Find all posts for one author',
  })
  async findAllPostsForOneAuthor(
    @Args('id', { type: () => IdScalar }) id: Id,
  ): Promise<Post[]> {
    return this.simpleService.findAllPostsForOneAuthor(id);
  }
}
