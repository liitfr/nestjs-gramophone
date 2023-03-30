import { Injectable } from '@nestjs/common';
import { Types as MongooseTypes } from 'mongoose';

import { Post, PostDocument } from '../../../blog/models/post.model';
import { Repository } from '../../../data/abstracts/repository.abstract';
import { repositoryDescription } from '../../../utils/repository.util';

@Injectable()
export abstract class PostsRepository extends Repository<PostDocument> {
  static [repositoryDescription] = 'Posts Repository';

  async findAllPostsForOneAuthor(
    authorId: MongooseTypes.ObjectId,
  ): Promise<Post[]> {
    throw new Error('Method not implemented.');
  }
}
