import { Injectable, Scope } from '@nestjs/common';
import { Document, Model, Types as MongooseTypes } from 'mongoose';

import { Trackable } from '../../utils/entity-enhancers/trackable.decorator';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class VersioningService<T> {
  private model: Model<T>;

  public setModel(model: Model<T>) {
    this.model = model;
  }

  public async findAllVersionsForOneOriginalId(
    originalId: MongooseTypes.ObjectId,
  ) {
    return this.model.find({ originalId });
  }

  public async findOneById(id: MongooseTypes.ObjectId) {
    return this.model.findById(id);
  }

  public async saveVersion(
    item: Document & Trackable,
    versionData: Record<string, any>,
  ) {
    const version = new this.model({
      originalId: item._id,
      version: item,
      creatorId: item.creatorId,
      updaterId: item.updaterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...versionData,
    });
    await version.save();
  }
}
