import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MongoRepository } from '../../../data/mongo/services/repository.service';

import { Type, TypeDocument } from '../../entities/type.entity';

import { TypesRepository } from '../abstract/types.repository';

export class TypesMongoRepository
  extends MongoRepository<TypeDocument>
  implements TypesRepository
{
  constructor(@InjectModel(Type.name) private entity: Model<TypeDocument>) {
    super(entity);
  }
}
