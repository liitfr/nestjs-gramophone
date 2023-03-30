import { PipeTransform, Injectable } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class AddTrackableFields implements PipeTransform<any> {
  async transform(value: any) {
    return {
      creatorId: new mongoose.Types.ObjectId('6424ca347788a0ca90372cf5'),
      updaterId: new mongoose.Types.ObjectId('6424ca347788a0ca90372cf5'),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...value,
    };
  }
}
