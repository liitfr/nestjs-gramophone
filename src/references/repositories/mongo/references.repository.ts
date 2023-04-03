import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MongoRepository } from '../../../data/mongo/services/repository.service';

import { Reference, ReferenceDocument } from '../../entities/reference.entity';

import { ReferencesRepository } from '../abstract/references.repository';

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
