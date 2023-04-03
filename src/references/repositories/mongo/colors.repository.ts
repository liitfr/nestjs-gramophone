import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MongoRepository } from '../../../data/mongo/services/repository.service';

import { Color, ColorDocument } from '../../entities/color.entity';

import { ColorsRepository } from '../abstract/colors.repository';

export class ColorsMongoRepository
  extends MongoRepository<ColorDocument>
  implements ColorsRepository
{
  constructor(@InjectModel(Color.name) private entity: Model<ColorDocument>) {
    super(entity);
  }
}
