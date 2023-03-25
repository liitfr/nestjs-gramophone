import {
  Args,
  Parent,
  ResolveField,
  Resolver,
  Query,
  Mutation,
} from '@nestjs/graphql';
import { Types as MongooseTypes } from 'mongoose';

import { MongoObjectIdScalar } from '../../utils/scalars/mongo-id.scalar';

import { Author } from '../models/author.model';
import { AuthorsService } from '../services/authors.service';
import { Post } from '../models/post.model';
import { PostsService } from '../services/posts.service';
import { CreatePostInput } from '../dto/create-post.input';

@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private authorsService: AuthorsService,
    private postsService: PostsService,
  ) {}

  @Query(() => Post)
  async post(
    @Args('id', { type: () => MongoObjectIdScalar }) id: MongooseTypes.ObjectId,
  ): Promise<Post> {
    return this.postsService.findOneById(id);
  }

  @Mutation(() => Post)
  async createPost(@Args('post') post: CreatePostInput) {
    return this.postsService.create(post);
  }
}
