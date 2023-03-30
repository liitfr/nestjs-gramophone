import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types as MongooseTypes } from 'mongoose';

import { Versioned } from '../../../versioning/decorators/versioned.decorator';
import { SaveVersion } from '../../../versioning/decorators/save-version.decorator';
import { MongoRepository } from '../../../data/mongo/services/repository.service';
import { repositoryDescription } from '../../../utils/repository.util';

import { Post, PostDocument } from '../../models/post.model';
import { CreatePostInput } from '../../dto/create-post.input';

import { PostsRepository } from '../abstract/posts.repository';

@Versioned(Post)
@Injectable()
export class MongoPostsRepository
  extends MongoRepository<PostDocument>
  implements PostsRepository
{
  constructor(@InjectModel(Post.name) private entity: Model<PostDocument>) {
    super(entity);
  }

  static [repositoryDescription] = 'Posts Repository';

  async findAllPostsForOneAuthor(
    authorId: MongooseTypes.ObjectId,
  ): Promise<Post[]> {
    return this.find({ authorId });
  }

  @SaveVersion()
  async create(post: CreatePostInput) {
    return super.create(post);
  }
}
