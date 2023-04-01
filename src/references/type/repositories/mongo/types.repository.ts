import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { repositoryDescription } from '../../../../utils/repositories/repository.util';
import { MongoRepository } from '../../../../data/mongo/services/repository.service';

import { Type, TypeDocument } from '../../models/type.model';

import { TypesRepository } from '../abstract/types.repository';

@Injectable()
export class TypesMongoRepository
  extends MongoRepository<TypeDocument>
  implements TypesRepository
{
  constructor(@InjectModel(Type.name) private entity: Model<TypeDocument>) {
    super(entity);
  }

  static [repositoryDescription] = 'Types Repository';
}
