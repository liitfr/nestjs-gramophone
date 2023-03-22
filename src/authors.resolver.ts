import {
  Args,
  Int,
  Parent,
  ResolveField,
  Resolver,
  Query,
} from '@nestjs/graphql';
import { UseInterceptors } from '@nestjs/common';

import { Author } from './author.model';
import { AuthorsService } from './authors.service';
import { Post } from './post.model';
import { PostsService } from './posts.service';
import { TestInterceptor } from './test.interceptor';

@UseInterceptors(TestInterceptor)
@Resolver(() => Author)
export class AuthorsResolver {
  constructor(
    private authorsService: AuthorsService,
    private postsService: PostsService,
  ) {}

  @Query(() => Author)
  author(@Args('id', { type: () => Int }) id: number): Author {
    return this.authorsService.findOneById(id);
  }

  @ResolveField(() => [Post], { name: 'posts' })
  async posts(@Parent() author: Author) {
    const { id } = author;
    return this.postsService.findAllPostsForOneAuthor(id);
  }
}
