/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Optional } from '@nestjs/common';

import { Id } from '../../utils/types/id.type';

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
    _doc: Partial<D>,
    _saveOptions?: unknown,
  ): Promise<CreatedModel | D> {
    throw new Error('Not implemented');
  }

  public createMany(
    _docs: Partial<D>[],
    _insertManyOptions?: unknown,
  ): Promise<CreatedModel[] | D[]> {
    throw new Error('Not implemented');
  }

  public uncertainFind(_filter: Partial<D>, _options?: unknown): Promise<D[]> {
    throw new Error('Not implemented');
  }

  public find(_filter: object, _options?: unknown): Promise<D[]> {
    throw new Error('Not implemented');
  }

  public uncertainFindById(_id: Id): Promise<D | null> {
    throw new Error('Not implemented');
  }

  public findById(_id: Id): Promise<D> {
    throw new Error('Not implemented');
  }

  public findAll(): Promise<D[]> {
    throw new Error('Not implemented');
  }

  public remove(_filter: Partial<D>): Promise<RemovedModel> {
    throw new Error('Not implemented');
  }

  public updateOne(
    _filter: Partial<D>,
    _update: Partial<D>,
    _options?: unknown,
  ): Promise<UpdatedModel> {
    throw new Error('Not implemented');
  }

  public updateMany(
    _filter: Partial<D>,
    _update: Partial<D>,
    _options?: unknown,
  ): Promise<UpdatedModel> {
    throw new Error('Not implemented');
  }

  public uncertainFindOneAndUpdate(
    _filter: object,
    _udpate: object,
    _options?: unknown,
  ): Promise<D | null> {
    throw new Error('Not implemented');
  }

  public findOneAndUpdate(
    _filter: object,
    _udpate: object,
    _options?: unknown,
  ): Promise<D> {
    throw new Error('Not implemented');
  }

  public countAll(): Promise<number> {
    throw new Error('Not implemented');
  }

  public count(_filter: Partial<D>, _options?: unknown): Promise<number> {
    throw new Error('Not implemented');
  }
}
