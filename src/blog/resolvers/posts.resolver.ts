import {
  Args,
  Parent,
  ResolveField,
  Resolver,
  Query,
  Mutation,
} from '@nestjs/graphql';

import { AddTrackableFields } from '../../utils/pipes/add-trackable-fields.pipe';
import { IdScalar } from '../../utils/scalars/id.scalar';
import { Id } from '../../utils/id.type';

import { Author } from '../models/author.model';
import { Post } from '../models/post.model';
import { PostInput } from '../dto/post.input';
import { AuthorsRepository } from '../repositories/abstract/authors.repository';
import { PostsRepository } from '../repositories/abstract/posts.repository';

@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private authorsRepository: AuthorsRepository,
    private postsRepository: PostsRepository,
  ) {}

  @Query(() => Post)
  async post(@Args('id', { type: () => IdScalar }) id: Id): Promise<Post> {
    return this.postsRepository.findById(id);
  }

  @ResolveField(() => Author, { name: 'author' })
  async author(@Parent() post: Post) {
    const { authorId } = post;
    return this.authorsRepository.findById(authorId);
  }

  @Mutation(() => Post)
  async createPost(@Args('post', AddTrackableFields) post: PostInput) {
    return this.postsRepository.create(post);
  }
}
