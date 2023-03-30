import { Inject, Injectable } from '@nestjs/common';

import { SimpleService } from '../../utils/services/simple.service';
import { Post, PostDocument } from '../../blog/models/post.model';
import { serviceDescription } from '../../utils/services/service.util';
import { Id } from '../../utils/id.type';

import { PostsRepository } from '../repositories/abstract/posts.repository';

@Injectable()
export class PostsService extends SimpleService<PostDocument> {
  constructor(
    @Inject(PostsRepository)
    private readonly postsRepository: PostsRepository,
  ) {
    super(postsRepository);
  }

  static [serviceDescription] = 'Posts Service';

  async findAllPostsForOneAuthor(authorId: Id): Promise<Post[]> {
    return this.postsRepository.find({ authorId });
  }
}
