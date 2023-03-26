import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types as MongooseTypes } from 'mongoose';

import { SaveVersion } from '../../versioning/decorators/save-version.decorator';
import { Versioned } from '../../versioning/decorators/versioned.decorator';

import { Author, AuthorDocument } from '../models/author.model';
import { CreateAuthorInput } from '../dto/create-author.input';

@Versioned(Author)
@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel(Author.name)
    private readonly authorModel: Model<AuthorDocument>,
  ) {}

  private readonly logger = new Logger(AuthorsService.name);

  async findOneById(id: MongooseTypes.ObjectId): Promise<Author> {
    return this.authorModel.findById(id).exec();
  }

  @SaveVersion()
  async create(author: CreateAuthorInput): Promise<Author> {
    const createdAuthor = new this.authorModel(author);
    return createdAuthor.save();
  }
}
