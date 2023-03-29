import { UserInputError } from 'apollo-server-express';
import { Injectable } from '@nestjs/common';
import * as mongoose from 'mongoose';
import {
  FilterQuery,
  Model,
  QueryOptions,
  SaveOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
  InsertManyOptions,
} from 'mongoose';
import { Document, Types as MongooseTypes } from 'mongoose';

import {
  CreatedModel,
  RemovedModel,
  UpdatedModel,
} from '../../abstracts/operations.abstract';
import { DbSession } from '../../abstracts/db-session.abstract';
import { Repository } from '../../abstracts/repository.abstract';
import { repositoryDescription } from 'src/utils/repository.util';

interface Throwable {
  errorIfUnknown?: boolean | null;
}

const mustThrowError = (options?: Throwable) =>
  typeof options?.errorIfUnknown === undefined ||
  options?.errorIfUnknown === null ||
  options?.errorIfUnknown === true;

@Injectable()
export class MongoRepository<T extends Document> implements Repository<T> {
  constructor(
    private readonly model: Model<T>,
    private readonly dbSession: DbSession<mongoose.ClientSession>,
  ) {}

  [repositoryDescription] = 'Mongo Repository';

  getEntityDescription(): string {
    return this[repositoryDescription];
  }

  async create(doc: object, saveOptions?: SaveOptions): Promise<CreatedModel> {
    const createdEntity = new this.model(doc);
    const savedResult = await createdEntity.save({
      ...saveOptions,
      session: this.dbSession.get(),
    });

    return { id: savedResult.id, created: !!savedResult.id };
  }

  async createMany(
    docs: object[],
    insertManyOptions?: InsertManyOptions,
  ): Promise<CreatedModel[]> {
    const createdEntities = await this.model.insertMany(docs, {
      session: this.dbSession.get(),
      ...insertManyOptions,
    });

    return createdEntities.map((entity) => ({
      id: entity._id,
      created: !!entity._id,
    }));
  }

  async find(
    filter: FilterQuery<T>,
    options?: QueryOptions<T> & Throwable,
  ): Promise<T[]> {
    const result = await this.model
      .find(filter, null, options)
      .session(this.dbSession.get());

    if (mustThrowError(options) && result.length === 0) {
      throw new UserInputError('No result with these filters.', {
        service: 'repository',
        method: 'find',
        entity: this.getEntityDescription(),
        filter,
        options,
        userFriendly:
          'Aucun résultat ne correspond à votre recherche. Veuillez réessayer.',
      });
    }

    return result;
  }

  async findById(
    id: MongooseTypes.ObjectId,
    options?: QueryOptions<T> & Throwable,
  ): Promise<T | null> {
    const result = await this.model
      .findById(id, null, options)
      .session(this.dbSession.get());

    if (mustThrowError(options) && !result) {
      throw new UserInputError('No result with this id.', {
        service: 'repository',
        method: 'findById',
        entity: this.getEntityDescription(),
        options,
        userFriendly:
          'Aucun résultat ne correspond à cet identifiant. Veuillez réessayer',
      });
    }

    return result;
  }

  async findAll(): Promise<T[]> {
    return await this.model.find().session(this.dbSession.get());
  }

  async remove(filter: FilterQuery<T>): Promise<RemovedModel> {
    const { deletedCount } = await this.model
      .deleteMany(filter)
      .session(this.dbSession.get());
    return { deletedCount, deleted: !!deletedCount };
  }

  async updateOne(
    filter: FilterQuery<T>,
    updated: UpdateWithAggregationPipeline | UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<UpdatedModel> {
    return await this.model
      .updateOne(filter, updated, options)
      .session(this.dbSession.get());
  }

  async updateMany(
    filter: FilterQuery<T>,
    updated: UpdateWithAggregationPipeline | UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<UpdatedModel> {
    return await this.model
      .updateMany(filter, updated, options)
      .session(this.dbSession.get());
  }

  async countAll(): Promise<number> {
    return await this.model.countDocuments().session(this.dbSession.get());
  }

  async count(
    filter: FilterQuery<T>,
    options: QueryOptions<T>,
  ): Promise<number> {
    return await this.model
      .countDocuments({ filter, options })
      .session(this.dbSession.get());
  }
}
