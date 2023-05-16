/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Optional } from '@nestjs/common';

import { Id } from '../../utils/types/id.type';
import { SimpleRepositoryInputObj } from '../../utils/resolvers/types/simple-repository-input.type';
import { SimpleRepositoryOutputObj } from '../../utils/resolvers/types/simple-repository-output.type';

import { RemovedModel, UpdatedModel } from './operations.abstract';

@Injectable()
export abstract class Repository<D extends object> {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(@Optional() readonly model?: any) {
    throw new Error('Not implemented');
  }

  public create(_params: {
    doc: SimpleRepositoryInputObj<D>;
    saveOptions?: unknown;
  }): Promise<SimpleRepositoryOutputObj<D>> {
    throw new Error('Not implemented');
  }

  public createMany(_params: {
    docs: SimpleRepositoryInputObj<D>[];
    insertManyOptions?: unknown;
  }): Promise<SimpleRepositoryOutputObj<D>[]> {
    throw new Error('Not implemented');
  }

  public uncertainFind(_params: {
    filter: object;
    options?: unknown;
  }): Promise<SimpleRepositoryOutputObj<D>[]> {
    throw new Error('Not implemented');
  }

  public find(_params: {
    filter: object;
    options?: unknown;
  }): Promise<SimpleRepositoryOutputObj<D>[]> {
    throw new Error('Not implemented');
  }

  public uncertainFindById(_params: {
    id: Id;
  }): Promise<SimpleRepositoryOutputObj<D> | null> {
    throw new Error('Not implemented');
  }

  public findById(_params: { id: Id }): Promise<SimpleRepositoryOutputObj<D>> {
    throw new Error('Not implemented');
  }

  public findAll(): Promise<SimpleRepositoryOutputObj<D>[]> {
    throw new Error('Not implemented');
  }

  public remove(_params: { filter: object }): Promise<RemovedModel> {
    throw new Error('Not implemented');
  }

  public updateOne(_params: {
    filter: object;
    update: object;
    options?: unknown;
  }): Promise<UpdatedModel> {
    throw new Error('Not implemented');
  }

  public updateMany(_params: {
    filter: object;
    update: object;
    options?: unknown;
  }): Promise<UpdatedModel> {
    throw new Error('Not implemented');
  }

  public uncertainFindOneAndUpdate(_params: {
    filter: object;
    update: object;
    options?: unknown;
  }): Promise<SimpleRepositoryOutputObj<D> | null> {
    throw new Error('Not implemented');
  }

  public findOneAndUpdate(_params: {
    filter: object;
    update: object;
    options?: unknown;
  }): Promise<SimpleRepositoryOutputObj<D>> {
    throw new Error('Not implemented');
  }

  public countAll(): Promise<number> {
    throw new Error('Not implemented');
  }

  public count(_params: {
    filter: object;
    options?: unknown;
  }): Promise<number> {
    throw new Error('Not implemented');
  }
}
