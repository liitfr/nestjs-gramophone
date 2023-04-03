import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Versioned } from '../../../versioning/decorators/versioned.decorator';
import { MongoRepository } from '../../../data/mongo/services/repository.service';

import { Post, PostDocument } from '../../entities/post.entity';

import { PostsRepository } from '../abstract/posts.repository';

@Versioned(Post)
export class PostsMongoRepository
  extends MongoRepository<PostDocument>
  implements PostsRepository
{
  constructor(@InjectModel(Post.name) private entity: Model<PostDocument>) {
    super(entity);
  }
}
