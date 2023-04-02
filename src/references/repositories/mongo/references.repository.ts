import { Injectable, SetMetadata } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MongoRepository } from '../../../data/mongo/services/repository.service';
import {
  REPOSITORY_METADATA,
  RepositoryMetadata,
} from '../../../utils/repositories/repository.util';

import { Reference, ReferenceDocument } from '../../entities/reference.entity';

import { ReferencesRepository } from '../abstract/references.repository';

@SetMetadata<symbol, RepositoryMetadata>(REPOSITORY_METADATA, {
  repositoryDescription: 'References Repository',
})
@Injectable()
export class ReferencesMongoRepository
  extends MongoRepository<ReferenceDocument>
  implements ReferencesRepository
{
  constructor(
    @InjectModel(Reference.name) private entity: Model<ReferenceDocument>,
  ) {
    super(entity);
  }
}
