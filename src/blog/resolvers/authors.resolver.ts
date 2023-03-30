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
import { Post } from '../models/post.model';
import { CreateAuthorInput } from '../dto/create-author.input';
import { PostsRepository } from '../repositories/abstract/posts.repository';
import { AuthorsRepository } from '../repositories/abstract/authors.repository';

@Resolver(() => Author)
export class AuthorsResolver {
  constructor(
    private authorsRepository: AuthorsRepository,
    private postsRepository: PostsRepository,
  ) {}

  @Query(() => Author)
  async author(
    @Args('id', { type: () => MongoObjectIdScalar }) id: MongooseTypes.ObjectId,
  ): Promise<Author> {
    return this.authorsRepository.findById(id);
  }

  @ResolveField(() => [Post], { name: 'posts' })
  async posts(@Parent() author: Author) {
    const { _id } = author;
    return this.postsRepository.findAllPostsForOneAuthor(_id);
  }

  @Mutation(() => Author)
  async createAuthor(@Args('author') author: CreateAuthorInput) {
    return this.authorsRepository.create(author);
  }
}
