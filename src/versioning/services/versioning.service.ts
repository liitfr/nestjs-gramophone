import { Injectable } from '@nestjs/common';
import { Types as MongooseTypes } from 'mongoose';

import { Id } from '../../utils/types/id.type';
import { Repository } from '../../data/abstracts/repository.abstract';
import { SimpleRepositoryOutputObj } from '../../utils/resolvers/types/simple-repository-output.type';

import { IVersioningEntity } from '../factories/versioning-entity.factory';
import { VersionDataInput } from '../dtos/version-data.input';
import { IdableAndTrackable } from '../types/idable-and-trackable.type';

@Injectable()
export class VersioningService<E extends IdableAndTrackable> {
  constructor(private readonly repository: Repository<IVersioningEntity<E>>) {}

  public async findAllVersionsForOneOriginalId(originalId: Id) {
    return this.repository.find({ originalId });
  }

  public async findOneById(id: Id) {
    return this.repository.findById(id);
  }

  public async saveVersion(
    item: SimpleRepositoryOutputObj<E>,
    versionData: VersionDataInput,
  ) {
    const now = new Date();

    return this.repository.create({
      _id: new MongooseTypes.ObjectId(),
      originalId: item._id,
      version: item as any, // HACK: what type should we use here to cast ?
      creatorId: item.creatorId,
      updaterId: item.updaterId,
      createdAt: now,
      updatedAt: now,
      ...versionData,
    });
  }
}
