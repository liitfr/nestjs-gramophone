import { Injectable } from '@nestjs/common';

import { repositoryDescription } from '../../utils/repositories/repository.util';

import {
  CreatedModel,
  RemovedModel,
  UpdatedModel,
} from './operations.abstract';

@Injectable()
export abstract class Repository<T> {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(entity: any) {
    throw new Error('Not implemented');
  }

  static [repositoryDescription] = 'Abstract Repository';

  public create(doc: object, saveOptions?: unknown): Promise<CreatedModel | T> {
    throw new Error('Not implemented');
  }

  public createMany(
    docs: object[],
    insertManyOptions?: unknown,
  ): Promise<CreatedModel[] | T[]> {
    throw new Error('Not implemented');
  }

  public find(filter: unknown, options?: unknown): Promise<T[]> {
    throw new Error('Not implemented');
  }

  public findById(id: unknown): Promise<T | null> {
    throw new Error('Not implemented');
  }

  public findAll(): Promise<T[]> {
    throw new Error('Not implemented');
  }

  public remove(filter: unknown): Promise<RemovedModel> {
    throw new Error('Not implemented');
  }

  public updateOne(
    filter: unknown,
    updated: unknown,
    options?: unknown,
  ): Promise<UpdatedModel> {
    throw new Error('Not implemented');
  }

  public updateMany(
    filter: unknown,
    updated: unknown,
    options?: unknown,
  ): Promise<UpdatedModel> {
    throw new Error('Not implemented');
  }

  public countAll(): Promise<number> {
    throw new Error('Not implemented');
  }

  public count(filter: unknown, options: unknown): Promise<number> {
    throw new Error('Not implemented');
  }
}
