/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Optional } from '@nestjs/common';

import { Id } from '../../utils/types/id.type';
import { SimpleRepositoryInputObj } from '../../utils/resolvers/types/simple-repository-input.type';
import { SimpleRepositoryOutputObj } from '../../utils/resolvers/types/simple-repository-output.type';

import {
  CreatedModel,
  RemovedModel,
  UpdatedModel,
} from './operations.abstract';

@Injectable()
export abstract class Repository<D extends object> {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(@Optional() readonly model?: any) {
    throw new Error('Not implemented');
  }

  public create(
    _doc: SimpleRepositoryInputObj<D>,
    _saveOptions?: unknown,
  ): Promise<CreatedModel | SimpleRepositoryOutputObj<D>> {
    throw new Error('Not implemented');
  }

  public createMany(
    _docs: SimpleRepositoryInputObj<D>[],
    _insertManyOptions?: unknown,
  ): Promise<CreatedModel[] | SimpleRepositoryOutputObj<D>[]> {
    throw new Error('Not implemented');
  }

  public uncertainFind(
    _filter: object,
    _options?: unknown,
  ): Promise<SimpleRepositoryOutputObj<D>[]> {
    throw new Error('Not implemented');
  }

  public find(
    _filter: object,
    _options?: unknown,
  ): Promise<SimpleRepositoryOutputObj<D>[]> {
    throw new Error('Not implemented');
  }

  public uncertainFindById(
    _id: Id,
  ): Promise<SimpleRepositoryOutputObj<D> | null> {
    throw new Error('Not implemented');
  }

  public findById(_id: Id): Promise<SimpleRepositoryOutputObj<D>> {
    throw new Error('Not implemented');
  }

  public findAll(): Promise<SimpleRepositoryOutputObj<D>[]> {
    throw new Error('Not implemented');
  }

  public remove(_filter: object): Promise<RemovedModel> {
    throw new Error('Not implemented');
  }

  public updateOne(
    _filter: object,
    _update: object,
    _options?: unknown,
  ): Promise<UpdatedModel> {
    throw new Error('Not implemented');
  }

  public updateMany(
    _filter: object,
    _update: object,
    _options?: unknown,
  ): Promise<UpdatedModel> {
    throw new Error('Not implemented');
  }

  public uncertainFindOneAndUpdate(
    _filter: object,
    _udpate: object,
    _options?: unknown,
  ): Promise<SimpleRepositoryOutputObj<D> | null> {
    throw new Error('Not implemented');
  }

  public findOneAndUpdate(
    _filter: object,
    _udpate: object,
    _options?: unknown,
  ): Promise<SimpleRepositoryOutputObj<D>> {
    throw new Error('Not implemented');
  }

  public countAll(): Promise<number> {
    throw new Error('Not implemented');
  }

  public count(_filter: object, _options?: unknown): Promise<number> {
    throw new Error('Not implemented');
  }
}
