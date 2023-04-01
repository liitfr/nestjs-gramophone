import { PipeTransform, Injectable } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class AddTrackableUpdateFields implements PipeTransform<any> {
  async transform(value: any) {
    return {
      updaterId: new mongoose.Types.ObjectId('6424ca347788a0ca90372cf5'),
      updatedAt: new Date(),
      ...value,
    };
  }
}
