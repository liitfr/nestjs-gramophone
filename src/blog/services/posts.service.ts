import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types as MongooseTypes } from 'mongoose';

import { Post, PostDocument } from '../models/post.model';
import { CreatePostInput } from '../dto/create-post.input';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
  ) {}

  private readonly logger = new Logger(PostsService.name);

  async findOneById(id: MongooseTypes.ObjectId): Promise<Post> {
    return this.postModel.findById(id).exec();
  }

  async findAllPostsForOneAuthor(
    authorId: MongooseTypes.ObjectId,
  ): Promise<Post[]> {
    return this.postModel.find({ authorId }).exec();
  }

  async create(post: CreatePostInput): Promise<Post> {
    const createdPost = new this.postModel(post);
    return createdPost.save();
  }
}
