import { Inject, Injectable, Optional } from '@nestjs/common';
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
import { Document } from 'mongoose';

import { Id } from '../../../utils/id.type';
import { SaveVersionIfEnabled } from '../../../versioning/decorators/save-version-if-enabled.decorator';
import { CustomError, ErrorCode } from '../../../utils/errors/custom.error';

import {
  CreatedModel,
  RemovedModel,
  UpdatedModel,
} from '../../abstracts/operations.abstract';
import { DbSession } from '../../abstracts/db-session.abstract';
import { Repository } from '../../abstracts/repository.abstract';

interface Throwable {
  errorIfUnknown?: boolean | null;
}

const mustThrowError = (options?: Throwable) =>
  typeof options?.errorIfUnknown === 'undefined' ||
  options?.errorIfUnknown === null ||
  options?.errorIfUnknown === true;

@Injectable()
export class MongoRepository<D extends Document> implements Repository<D> {
  constructor(@Optional() private readonly model: Model<D>) {}

  @Inject(DbSession)
  private readonly dbSession: DbSession<mongoose.ClientSession>;

  @SaveVersionIfEnabled()
  async create(
    doc: object,
    saveOptions?: SaveOptions & { returnOnlyId?: boolean },
  ): Promise<CreatedModel | D> {
    const createdEntity = new this.model(doc);
    const savedResult = await createdEntity.save({
      ...saveOptions,
      session: this.dbSession.get(),
    });

    return saveOptions?.returnOnlyId
      ? { id: savedResult._id, created: !!savedResult._id }
      : savedResult;
  }

  @SaveVersionIfEnabled()
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
    filter: FilterQuery<D>,
    options?: QueryOptions<D> & Throwable,
  ): Promise<D[]> {
    const result = await this.model
      .find(filter, null, options)
      .session(this.dbSession.get());

    if (mustThrowError(options) && result.length === 0) {
      throw new CustomError(
        'No result with these filters.',
        ErrorCode.NOT_FOUND,
        {
          fr: 'Aucun résultat ne correspond à votre recherche. Veuillez réessayer.',
        },
        {
          service: 'repository',
          method: 'find',
          model: this.model.name,
          filter,
          options,
        },
      );
    }

    return result;
  }

  async findById(
    id: Id,
    options?: QueryOptions<D> & Throwable,
  ): Promise<D | null> {
    const result = await this.model
      .findById(id, null, options)
      .session(this.dbSession.get());
    if (mustThrowError(options) && !result) {
      throw new CustomError(
        'No result with this id.',
        ErrorCode.NOT_FOUND,
        {
          fr: 'Aucun résultat ne correspond à cet identifiant. Veuillez réessayer',
        },
        {
          service: 'repository',
          method: 'findById',
          model: this.model.name,
          options,
        },
      );
    }

    return result;
  }

  async findAll(): Promise<D[]> {
    return this.model.find().session(this.dbSession.get());
  }

  @SaveVersionIfEnabled()
  async remove(filter: FilterQuery<D>): Promise<RemovedModel> {
    const { deletedCount } = await this.model
      .deleteMany(filter)
      .session(this.dbSession.get());
    return { deletedCount, deleted: !!deletedCount };
  }

  @SaveVersionIfEnabled()
  async updateOne(
    filter: FilterQuery<D>,
    update: UpdateWithAggregationPipeline | UpdateQuery<D>,
    options?: QueryOptions<D>,
  ): Promise<UpdatedModel> {
    return this.model
      .updateOne(filter, update, { new: true, ...options })
      .session(this.dbSession.get());
  }

  @SaveVersionIfEnabled()
  async updateMany(
    filter: FilterQuery<D>,
    update: UpdateWithAggregationPipeline | UpdateQuery<D>,
    options?: QueryOptions<D>,
  ): Promise<UpdatedModel> {
    return this.model
      .updateMany(filter, update, { new: true, ...options })
      .session(this.dbSession.get());
  }

  @SaveVersionIfEnabled()
  public async findOneAndUpdate(
    filter: FilterQuery<D>,
    update: UpdateQuery<D>,
    options?: QueryOptions<D> & Throwable,
  ): Promise<D | null> {
    const result = await this.model.findOneAndUpdate(filter, update, {
      new: true,
      ...options,
    });
    if (mustThrowError(options) && !result) {
      throw new CustomError(
        'No item with this id.',
        ErrorCode.NOT_FOUND,
        {
          fr: 'Aucun élément ne correspond à cet identifiant. Veuillez réessayer',
        },
        {
          service: 'repository',
          method: 'findOneAndUpdate',
          model: this.model.name,
          options,
        },
      );
    }
    return result;
  }

  async countAll(): Promise<number> {
    return this.model.countDocuments().session(this.dbSession.get());
  }

  async count(
    filter: FilterQuery<D>,
    options?: QueryOptions<D>,
  ): Promise<number> {
    return this.model
      .countDocuments(filter, options)
      .session(this.dbSession.get());
  }
}
