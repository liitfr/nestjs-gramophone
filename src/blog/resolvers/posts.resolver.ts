import {
  Args,
  Parent,
  ResolveField,
  Resolver,
  Query,
  Mutation,
} from '@nestjs/graphql';
import { Types as MongooseTypes } from 'mongoose';

import { AddTrackableFields } from '../../utils/pipes/add-trackable-fields.pipe';
import { MongoObjectIdScalar } from '../../utils/scalars/mongo-id.scalar';

import { Author } from '../models/author.model';
import { Post } from '../models/post.model';
import { CreatePostInput } from '../dto/create-post.input';
import { AuthorsRepository } from '../repositories/abstract/authors.repository';
import { PostsRepository } from '../repositories/abstract/posts.repository';

@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private authorsRepository: AuthorsRepository,
    private postsRepository: PostsRepository,
  ) {}

  @Query(() => Post)
  async post(
    @Args('id', { type: () => MongoObjectIdScalar }) id: MongooseTypes.ObjectId,
  ): Promise<Post> {
    return this.postsRepository.findById(id);
  }

  @ResolveField(() => Author, { name: 'author' })
  async author(@Parent() post: Post) {
    const { authorId } = post;
    return this.authorsRepository.findById(authorId);
  }

  @Mutation(() => Post)
  async createPost(@Args('post', AddTrackableFields) post: CreatePostInput) {
    return this.postsRepository.create(post);
  }
}
