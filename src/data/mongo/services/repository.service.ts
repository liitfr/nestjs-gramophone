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
import { CustomError, ErrorCode } from '../../../utils/errors/custom.error';

import {
  CreatedModel,
  RemovedModel,
  UpdatedModel,
} from '../../abstracts/operations.abstract';
import { DbSession } from '../../abstracts/db-session.abstract';
import { Repository } from '../../abstracts/repository.abstract';

@Injectable()
export class MongoRepository<D extends Document> implements Repository<D> {
  constructor(
    @Inject(DbSession)
    private readonly dbSession: DbSession<mongoose.ClientSession>,
    @Optional() readonly model?: Model<D>,
  ) {}

  private getModel() {
    if (!this.model) {
      throw new CustomError(
        'Model not found',
        ErrorCode.UNKNOWN_ERROR,
        {
          fr: "Le modèle n'a pas été trouvé.",
        },
        {
          service: 'repositoryService',
          method: 'checkModel',
        },
      );
    }
    return this.model;
  }

  async create(
    doc: object,
    saveOptions?: SaveOptions & { returnOnlyId?: boolean },
  ): Promise<CreatedModel | D> {
    const model = this.getModel();
    const createdEntity = new model(doc);
    const savedResult = await createdEntity.save({
      ...saveOptions,
      session: this.dbSession.get(),
    });

    return saveOptions?.returnOnlyId
      ? { id: savedResult._id, created: !!savedResult._id }
      : savedResult;
  }

  async createMany(
    docs: object[],
    insertManyOptions?: InsertManyOptions,
  ): Promise<CreatedModel[]> {
    const model = this.getModel();
    const createdEntities = await model.insertMany(docs, {
      session: this.dbSession.get(),
      ...insertManyOptions,
    });

    return createdEntities.map((entity) => ({
      id: entity._id,
      created: !!entity._id,
    }));
  }

  async uncertainFind(
    filter: FilterQuery<D>,
    options?: QueryOptions<D>,
  ): Promise<D[]> {
    const model = this.getModel();

    return model.find(filter, null, options).session(this.dbSession.get());
  }

  async find(filter: FilterQuery<D>, options?: QueryOptions<D>): Promise<D[]> {
    const result = await this.uncertainFind(filter, options);

    if (!result || result.length === 0) {
      throw new CustomError(
        'No result with these filters.',
        ErrorCode.NOT_FOUND,
        {
          fr: 'Aucun résultat ne correspond à votre recherche. Veuillez réessayer.',
        },
        {
          service: 'repository',
          method: 'find',
          model: this.getModel().name,
          filter,
          options,
        },
      );
    }

    return result;
  }

  async uncertainFindById(
    id: Id,
    options?: QueryOptions<D>,
  ): Promise<D | null> {
    const model = this.getModel();

    return model.findById(id, null, options).session(this.dbSession.get());
  }

  async findById(id: Id, options?: QueryOptions<D>): Promise<D> {
    const result = await this.uncertainFindById(id, options);

    if (!result) {
      throw new CustomError(
        'No result with this id.',
        ErrorCode.NOT_FOUND,
        {
          fr: 'Aucun résultat ne correspond à cet identifiant. Veuillez réessayer',
        },
        {
          service: 'repository',
          method: 'findById',
          model: this.getModel().name,
          options,
        },
      );
    }

    return result;
  }

  async findAll(): Promise<D[]> {
    const model = this.getModel();
    return model.find().session(this.dbSession.get());
  }

  async remove(filter: FilterQuery<D>): Promise<RemovedModel> {
    const model = this.getModel();
    const { deletedCount } = await model
      .deleteMany(filter)
      .session(this.dbSession.get());
    return { deletedCount, deleted: !!deletedCount };
  }

  async updateOne(
    filter: FilterQuery<D>,
    update: UpdateWithAggregationPipeline | UpdateQuery<D>,
    options?: QueryOptions<D>,
  ): Promise<UpdatedModel> {
    const model = this.getModel();
    return model
      .updateOne(filter, update, { new: true, ...options })
      .session(this.dbSession.get());
  }

  async updateMany(
    filter: FilterQuery<D>,
    update: UpdateWithAggregationPipeline | UpdateQuery<D>,
    options?: QueryOptions<D>,
  ): Promise<UpdatedModel> {
    const model = this.getModel();
    return model
      .updateMany(filter, update, { new: true, ...options })
      .session(this.dbSession.get());
  }

  public async uncertainFindOneAndUpdate(
    filter: FilterQuery<D>,
    update: UpdateQuery<D>,
    options?: QueryOptions<D>,
  ): Promise<D | null> {
    const model = this.getModel();

    return model.findOneAndUpdate(filter, update, {
      new: true,
      ...options,
    });
  }

  public async findOneAndUpdate(
    filter: FilterQuery<D>,
    update: UpdateQuery<D>,
    options?: QueryOptions<D>,
  ): Promise<D> {
    const result = await this.uncertainFindOneAndUpdate(
      filter,
      update,
      options,
    );

    if (!result) {
      throw new CustomError(
        'No item with this id.',
        ErrorCode.NOT_FOUND,
        {
          fr: 'Aucun élément ne correspond à cet identifiant. Veuillez réessayer',
        },
        {
          service: 'repository',
          method: 'findOneAndUpdate',
          model: this.getModel().name,
          options,
        },
      );
    }

    return result;
  }

  async countAll(): Promise<number> {
    const model = this.getModel();
    return model.countDocuments().session(this.dbSession.get());
  }

  async count(
    filter: FilterQuery<D>,
    options?: QueryOptions<D>,
  ): Promise<number> {
    const model = this.getModel();
    return model.countDocuments(filter, options).session(this.dbSession.get());
  }
}
