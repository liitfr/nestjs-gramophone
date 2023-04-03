import { SimpleServiceFactory } from '../../utils/services/simple-service.factory';
import { Id } from '../../utils/id.type';

import { Post } from '../entities/post.entity';
import { PostsRepository } from '../repositories/abstract/posts.repository';
// import { Injectable } from '@nestjs/common';

// @Injectable()
export class PostsService extends SimpleServiceFactory(Post, PostsRepository) {
  async findAllPostsForOneAuthor(authorId: Id): Promise<Post[]> {
    return this.repository.find({ authorId });
  }
}
