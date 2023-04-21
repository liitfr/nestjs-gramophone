import { Injectable } from '@nestjs/common';
import { HydratedDocument } from 'mongoose';

import { Trackable } from '../../utils/entities/simple-entity.decorator';
import { Id } from '../../utils/types/id.type';
import { Repository } from '../../data/abstracts/repository.abstract';

import { IVersioningEntity } from '../factories/versioning-entity.factory';
import { VersionDataInput } from '../dtos/version-data.input';

@Injectable()
export class VersioningService<E extends Trackable> {
  constructor(private readonly repository: Repository<IVersioningEntity<E>>) {}

  public async findAllVersionsForOneOriginalId(originalId: Id) {
    return this.repository.find({ originalId });
  }

  public async findOneById(id: Id) {
    return this.repository.findById(id);
  }

  public async saveVersion(
    item: HydratedDocument<E>,
    versionData: VersionDataInput,
  ) {
    const now = new Date();

    return this.repository.create({
      originalId: item._id,
      version: item,
      creatorId: item.creatorId,
      updaterId: item.updaterId,
      createdAt: now,
      updatedAt: now,
      ...versionData,
    });
  }
}
