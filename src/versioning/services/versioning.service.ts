import { Injectable } from '@nestjs/common';
import { Document } from 'mongoose';

import { Trackable } from '../../utils/entities/simple-entity.decorator';
import { Id } from '../../utils/id.type';
import { Repository } from '../../data/abstracts/repository.abstract';

@Injectable()
export class VersioningService<D> {
  constructor(private readonly repository: Repository<D>) {}

  public async findAllVersionsForOneOriginalId(originalId: Id) {
    return this.repository.find({ originalId });
  }

  public async findOneById(id: Id) {
    return this.repository.findById(id);
  }

  public async saveVersion(
    item: Document & Trackable,
    versionData: Record<string, any>,
  ) {
    return this.repository.create({
      originalId: item._id,
      version: item,
      creatorId: item.creatorId,
      updaterId: item.updaterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...versionData,
    });
  }
}
