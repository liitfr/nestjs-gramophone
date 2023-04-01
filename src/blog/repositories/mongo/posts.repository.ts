import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Versioned } from '../../../versioning/decorators/versioned.decorator';
import { MongoRepository } from '../../../data/mongo/services/repository.service';
import { repositoryDescription } from '../../../utils/repositories/repository.util';

import { Post, PostDocument } from '../../models/post.model';

import { PostsRepository } from '../abstract/posts.repository';

@Versioned(Post)
@Injectable()
export class PostsMongoRepository
  extends MongoRepository<PostDocument>
  implements PostsRepository
{
  constructor(@InjectModel(Post.name) private entity: Model<PostDocument>) {
    super(entity);
  }

  static [repositoryDescription] = 'Posts Repository';
}
