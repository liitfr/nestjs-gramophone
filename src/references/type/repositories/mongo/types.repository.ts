import { Injectable, SetMetadata } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MongoRepository } from '../../../../data/mongo/services/repository.service';
import {
  REPOSITORY_METADATA,
  RepositoryMetadata,
} from '../../../../utils/repositories/repository.util';

import { Type, TypeDocument } from '../../models/type.model';

import { TypesRepository } from '../abstract/types.repository';

@SetMetadata<symbol, RepositoryMetadata>(REPOSITORY_METADATA, {
  repositoryDescription: 'Types Repository',
})
@Injectable()
export class TypesMongoRepository
  extends MongoRepository<TypeDocument>
  implements TypesRepository
{
  constructor(@InjectModel(Type.name) private entity: Model<TypeDocument>) {
    super(entity);
  }
}
