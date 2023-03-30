import { Injectable } from '@nestjs/common';
import { Types as MongooseTypes } from 'mongoose';

import { Post, PostDocument } from '../../../blog/models/post.model';
import { Repository } from '../../../data/abstracts/repository.abstract';
import { repositoryDescription } from '../../../utils/repositories/repository.util';

@Injectable()
export abstract class PostsRepository extends Repository<PostDocument> {
  static [repositoryDescription] = 'Posts Repository';
}
