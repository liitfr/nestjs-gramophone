import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import { Author, AuthorDocument } from '../../../blog/models/author.model';
import { MongoRepository } from '../../../data/mongo/services/repository.service';
import { repositoryDescription } from '../../../utils/repositories/repository.util';

import { AuthorsRepository } from '../abstract/authors.repository';

@Injectable()
export class AuthorsMongoRepository
  extends MongoRepository<AuthorDocument>
  implements AuthorsRepository
{
  constructor(@InjectModel(Author.name) private entity: Model<AuthorDocument>) {
    super(entity);
  }

  static [repositoryDescription] = 'Authors Repository';
}
