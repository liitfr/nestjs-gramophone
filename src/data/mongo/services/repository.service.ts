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

import { Id } from '../../../utils/types/id.type';
import { CustomError, ErrorCode } from '../../../utils/errors/custom.error';
import { SimpleRepositoryInputObj } from '../../../utils/resolvers/types/simple-repository-input.type';
import { SimpleRepositoryOutputObj } from '../../../utils/resolvers/types/simple-repository-output.type';

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
        ErrorCode.INTERNAL_SERVER_ERROR,
        {
          fr: "Le modèle n'a pas été trouvé.",
        },
        {
          service: 'MongoRepository',
          method: 'checkModel',
        },
      );
    }
    return this.model;
  }

  async create(
    doc: SimpleRepositoryInputObj<D>,
    saveOptions?: SaveOptions & { returnOnlyId?: boolean },
  ): Promise<CreatedModel | SimpleRepositoryOutputObj<D>> {
    const model = this.getModel();

    const createdEntity = new model(doc);

    const savedResult = await createdEntity.save({
      ...saveOptions,
      session: this.dbSession.get(),
    });

    const pojoResult = savedResult.toObject();

    return saveOptions?.returnOnlyId
      ? { _id: pojoResult._id as Id, created: !!pojoResult._id }
      : pojoResult;
  }

  async createMany(
    docs: SimpleRepositoryInputObj<D>[],
    insertManyOptions?: InsertManyOptions,
  ): Promise<CreatedModel[]> {
    const model = this.getModel();

    const createdEntities = await model.insertMany(docs, {
      session: this.dbSession.get(),
      ...insertManyOptions,
    });

    return createdEntities.map((entity) => {
      const pojoEntity = entity.toObject();

      return {
        _id: pojoEntity._id as Id,
        created: !!pojoEntity._id,
      };
    });
  }

  async uncertainFind(
    filter: FilterQuery<D>,
    options?: QueryOptions<D>,
  ): Promise<SimpleRepositoryOutputObj<D>[]> {
    const model = this.getModel();

    const result = await model
      .find(filter, null, options)
      .session(this.dbSession.get());

    const pojoResult = result.map((doc) => doc.toObject());

    return pojoResult;
  }

  async find(
    filter: FilterQuery<D>,
    options?: QueryOptions<D>,
  ): Promise<SimpleRepositoryOutputObj<D>[]> {
    const result = await this.uncertainFind(filter, options);

    if (!result || result.length === 0) {
      throw new CustomError(
        `No result when querying ${
          this.model?.modelName
        } model with following filters : ${JSON.stringify(filter)}`,
        ErrorCode.NOT_FOUND,
        {
          fr: 'Aucun résultat ne correspond à votre recherche. Veuillez réessayer.',
        },
        {
          service: 'MongoRepository',
          method: 'find',
          model: this.getModel().modelName,
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
  ): Promise<SimpleRepositoryOutputObj<D> | null> {
    const model = this.getModel();

    const result = await model
      .findById(id, null, options)
      .session(this.dbSession.get());

    const pojoResult = result ? result.toObject() : null;

    return pojoResult;
  }

  async findById(
    id: Id,
    options?: QueryOptions<D>,
  ): Promise<SimpleRepositoryOutputObj<D>> {
    const result = await this.uncertainFindById(id, options);

    if (!result) {
      throw new CustomError(
        'No result with this id.',
        ErrorCode.NOT_FOUND,
        {
          fr: 'Aucun résultat ne correspond à cet identifiant. Veuillez réessayer',
        },
        {
          service: 'MongoRepository',
          method: 'findById',
          model: this.getModel().modelName,
          options,
        },
      );
    }

    return result;
  }

  async findAll(): Promise<SimpleRepositoryOutputObj<D>[]> {
    const model = this.getModel();

    const result = await model.find().session(this.dbSession.get());

    const pojoResult = result.map((doc) => doc.toObject());

    return pojoResult;
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
  ): Promise<SimpleRepositoryOutputObj<D> | null> {
    const model = this.getModel();

    const result = await model.findOneAndUpdate(filter, update, {
      new: true,
      ...options,
    });

    const pojoResult = result ? result.toObject() : null;

    return pojoResult;
  }

  public async findOneAndUpdate(
    filter: FilterQuery<D>,
    update: UpdateQuery<D>,
    options?: QueryOptions<D>,
  ): Promise<SimpleRepositoryOutputObj<D>> {
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
          service: 'MongoRepository',
          method: 'findOneAndUpdate',
          model: this.getModel().modelName,
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
