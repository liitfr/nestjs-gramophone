import { SimpleServiceFactory } from '../../utils/services/simple-service.factory';
import { Id } from '../../utils/id.type';
import { Versioned } from '../../versioning/decorators/versioned.decorator';

import { Post } from '../entities/post.entity';

@Versioned(Post)
export class PostsService extends SimpleServiceFactory(Post) {
  async findAllPostsForOneAuthor(authorId: Id): Promise<Post[]> {
    return this.repository.find({ authorId });
  }
}
