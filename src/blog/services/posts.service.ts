import { Inject, Injectable } from '@nestjs/common';

import { RepositoryService } from '../../utils/services/repository-service.service';
import { PostDocument } from '../../blog/models/post.model';
import { serviceDescription } from '../../utils/services/service.util';

import { PostsRepository } from '../repositories/abstract/posts.repository';

@Injectable()
export class PostsService extends RepositoryService<PostDocument> {
  constructor(
    @Inject(PostsRepository)
    private readonly postsRepository: PostsRepository,
  ) {
    super(postsRepository);
  }

  static [serviceDescription] = 'Posts Service';
}
