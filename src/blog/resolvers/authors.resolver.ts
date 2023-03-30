import {
  Args,
  Parent,
  ResolveField,
  Resolver,
  Query,
  Mutation,
} from '@nestjs/graphql';
import { Types as MongooseTypes } from 'mongoose';

import { IdScalar } from '../../utils/scalars/id.scalar';

import { Author } from '../models/author.model';
import { Post } from '../models/post.model';
import { CreateAuthorInput } from '../dto/create-author.input';
import { AuthorsService } from '../services/authors.service';
import { PostsService } from '../services/posts.service';

@Resolver(() => Author)
export class AuthorsResolver {
  constructor(
    private authorsService: AuthorsService,
    private postsService: PostsService,
  ) {}

  @Query(() => Author)
  async author(
    @Args('id', { type: () => IdScalar }) id: MongooseTypes.ObjectId,
  ): Promise<Author> {
    return this.authorsService.findById(id);
  }

  @ResolveField(() => [Post], { name: 'posts' })
  async posts(@Parent() author: Author) {
    const { _id } = author;
    return this.postsService.findAllPostsForOneAuthor(_id);
  }

  @Mutation(() => Author)
  async createAuthor(@Args('author') author: CreateAuthorInput) {
    return this.authorsService.create(author);
  }
}
