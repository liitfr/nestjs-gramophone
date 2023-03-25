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
import { CreateAuthorInput } from '../dto/create-author.input';

@Resolver(() => Author)
export class AuthorsResolver {
  constructor(
    private authorsService: AuthorsService,
    private postsService: PostsService,
  ) {}

  @Query(() => Author)
  async author(
    @Args('id', { type: () => MongoObjectIdScalar }) id: MongooseTypes.ObjectId,
  ): Promise<Author> {
    return this.authorsService.findOneById(id);
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
