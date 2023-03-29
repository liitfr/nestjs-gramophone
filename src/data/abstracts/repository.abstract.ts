import { Injectable } from '@nestjs/common';

import { repositoryDescription } from '../../utils/repository.util';

import {
  CreatedModel,
  RemovedModel,
  UpdatedModel,
} from './operations.abstract';

@Injectable()
export abstract class Repository<T> {
  constructor(entity: any) {
    throw new Error('Method not implemented.');
  }

  [repositoryDescription] = 'Abstract Repository';

  public create(doc: object, saveOptions?: unknown): Promise<CreatedModel> {
    throw new Error('Method not implemented.');
  }

  async createMany(
    docs: object[],
    insertManyOptions?: unknown,
  ): Promise<CreatedModel[]> {
    throw new Error('Method not implemented.');
  }

  public find(filter: unknown, options?: unknown): Promise<T[]> {
    throw new Error('Method not implemented.');
  }

  public findById(id: unknown): Promise<T | null> {
    throw new Error('Method not implemented.');
  }

  public findAll(): Promise<T[]> {
    throw new Error('Method not implemented.');
  }

  public remove(filter: unknown): Promise<RemovedModel> {
    throw new Error('Method not implemented.');
  }

  public updateOne(
    filter: unknown,
    updated: unknown,
    options?: unknown,
  ): Promise<UpdatedModel> {
    throw new Error('Method not implemented.');
  }

  public updateMany(
    filter: unknown,
    updated: unknown,
    options?: unknown,
  ): Promise<UpdatedModel> {
    throw new Error('Method not implemented.');
  }

  public countAll(): Promise<number> {
    throw new Error('Method not implemented.');
  }

  public count(filter: unknown, options: unknown): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
