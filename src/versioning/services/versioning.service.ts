import { Injectable } from '@nestjs/common';
import { Types as MongooseTypes } from 'mongoose';

import {
  Idable,
  Trackable,
} from '../../utils/entities/simple-entity.decorator';
import { Id } from '../../utils/types/id.type';
import { Repository } from '../../data/abstracts/repository.abstract';
import { OptionalId } from '../../utils/types/optional-ids.type';
import { SimpleRepositoryOutputObj } from '../../utils/resolvers/types/simple-repository-output.type';

import { IVersioningEntity } from '../factories/versioning-entity.factory';
import { VersionDataInput } from '../dtos/version-data.input';

interface IdableAndTrackable extends Trackable, Idable {}

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
      version: item as OptionalId<IVersioningEntity<E>, 'version'>, // HACK: why do I have to cast to OptionalIds ?
      creatorId: item.creatorId,
      updaterId: item.updaterId,
      createdAt: now,
      updatedAt: now,
      ...versionData,
    });
  }
}
