import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Author, AuthorDocument } from '../../entities/author.entity';
import { MongoRepository } from '../../../data/mongo/services/repository.service';

import { AuthorsRepository } from '../abstract/authors.repository';

export class AuthorsMongoRepository
  extends MongoRepository<AuthorDocument>
  implements AuthorsRepository
{
  constructor(@InjectModel(Author.name) private entity: Model<AuthorDocument>) {
    super(entity);
  }
}
