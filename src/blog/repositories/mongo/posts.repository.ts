import { Injectable, SetMetadata } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Versioned } from '../../../versioning/decorators/versioned.decorator';
import { MongoRepository } from '../../../data/mongo/services/repository.service';
import {
  REPOSITORY_METADATA,
  RepositoryMetadata,
} from '../../../utils/repositories/repository.util';

import { Post, PostDocument } from '../../entities/post.entity';

import { PostsRepository } from '../abstract/posts.repository';

@Versioned(Post)
@SetMetadata<symbol, RepositoryMetadata>(REPOSITORY_METADATA, {
  repositoryDescription: 'Posts Repository',
})
@Injectable()
export class PostsMongoRepository
  extends MongoRepository<PostDocument>
  implements PostsRepository
{
  constructor(@InjectModel(Post.name) private entity: Model<PostDocument>) {
    super(entity);
  }
}
