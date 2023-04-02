import { Injectable, SetMetadata } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MongoRepository } from '../../../data/mongo/services/repository.service';
import {
  REPOSITORY_METADATA,
  RepositoryMetadata,
} from '../../../utils/repositories/repository.util';

import { Color, ColorDocument } from '../../models/color.model';

import { ColorsRepository } from '../abstract/colors.repository';

@SetMetadata<symbol, RepositoryMetadata>(REPOSITORY_METADATA, {
  repositoryDescription: 'Colors Repository',
})
@Injectable()
export class ColorsMongoRepository
  extends MongoRepository<ColorDocument>
  implements ColorsRepository
{
  constructor(@InjectModel(Color.name) private entity: Model<ColorDocument>) {
    super(entity);
  }
}
