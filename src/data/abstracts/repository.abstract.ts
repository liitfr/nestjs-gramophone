import { Injectable } from '@nestjs/common';

import { SaveVersionIfEnabled } from '../../versioning/decorators/save-version-if-enabled.decorator';

import {
  CreatedModel,
  RemovedModel,
  UpdatedModel,
} from './operations.abstract';

@Injectable()
export abstract class Repository<D> {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(entity: any) {
    throw new Error('Not implemented');
  }

  @SaveVersionIfEnabled()
  public create(doc: object, saveOptions?: unknown): Promise<CreatedModel | D> {
    throw new Error('Not implemented');
  }

  @SaveVersionIfEnabled()
  public createMany(
    docs: object[],
    insertManyOptions?: unknown,
  ): Promise<CreatedModel[] | D[]> {
    throw new Error('Not implemented');
  }

  public find(filter: unknown, options?: unknown): Promise<D[]> {
    throw new Error('Not implemented');
  }

  public findById(id: unknown): Promise<D | null> {
    throw new Error('Not implemented');
  }

  public findAll(): Promise<D[]> {
    throw new Error('Not implemented');
  }

  @SaveVersionIfEnabled()
  public remove(filter: unknown): Promise<RemovedModel> {
    throw new Error('Not implemented');
  }

  @SaveVersionIfEnabled()
  public updateOne(
    filter: unknown,
    update: unknown,
    options?: unknown,
  ): Promise<UpdatedModel> {
    throw new Error('Not implemented');
  }

  @SaveVersionIfEnabled()
  public updateMany(
    filter: unknown,
    update: unknown,
    options?: unknown,
  ): Promise<UpdatedModel> {
    throw new Error('Not implemented');
  }

  @SaveVersionIfEnabled()
  public findOneAndUpdate(
    filter: unknown,
    udpate: unknown,
    options?: unknown,
  ): Promise<D | null> {
    throw new Error('Not implemented');
  }

  public countAll(): Promise<number> {
    throw new Error('Not implemented');
  }

  public count(filter: unknown, options?: unknown): Promise<number> {
    throw new Error('Not implemented');
  }
}
