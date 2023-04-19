/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Optional } from '@nestjs/common';

import {
  CreatedModel,
  RemovedModel,
  UpdatedModel,
} from './operations.abstract';

@Injectable()
export abstract class Repository<D> {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(@Optional() readonly model?: any) {
    throw new Error('Not implemented');
  }

  public create(
    _doc: object,
    _saveOptions?: unknown,
  ): Promise<CreatedModel | D> {
    throw new Error('Not implemented');
  }

  public createMany(
    _docs: object[],
    _insertManyOptions?: unknown,
  ): Promise<CreatedModel[] | D[]> {
    throw new Error('Not implemented');
  }

  public uncertainFind(_filter: unknown, _options?: unknown): Promise<D[]> {
    throw new Error('Not implemented');
  }

  public find(_filter: unknown, _options?: unknown): Promise<D[]> {
    throw new Error('Not implemented');
  }

  public uncertainFindById(_id: unknown): Promise<D | null> {
    throw new Error('Not implemented');
  }

  public findById(_id: unknown): Promise<D> {
    throw new Error('Not implemented');
  }

  public findAll(): Promise<D[]> {
    throw new Error('Not implemented');
  }

  public remove(_filter: unknown): Promise<RemovedModel> {
    throw new Error('Not implemented');
  }

  public updateOne(
    _filter: unknown,
    _update: unknown,
    _options?: unknown,
  ): Promise<UpdatedModel> {
    throw new Error('Not implemented');
  }

  public updateMany(
    _filter: unknown,
    _update: unknown,
    _options?: unknown,
  ): Promise<UpdatedModel> {
    throw new Error('Not implemented');
  }

  public uncertainFindOneAndUpdate(
    _filter: unknown,
    _udpate: unknown,
    _options?: unknown,
  ): Promise<D | null> {
    throw new Error('Not implemented');
  }

  public findOneAndUpdate(
    _filter: unknown,
    _udpate: unknown,
    _options?: unknown,
  ): Promise<D> {
    throw new Error('Not implemented');
  }

  public countAll(): Promise<number> {
    throw new Error('Not implemented');
  }

  public count(_filter: unknown, _options?: unknown): Promise<number> {
    throw new Error('Not implemented');
  }
}
