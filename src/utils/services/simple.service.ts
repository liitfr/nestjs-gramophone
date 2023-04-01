import { Injectable } from '@nestjs/common';

import { Repository } from '../../data/abstracts/repository.abstract';
import {
  CreatedModel,
  RemovedModel,
  UpdatedModel,
} from '../../data/abstracts/operations.abstract';

@Injectable()
export abstract class SimpleService<D> implements Repository<D> {
  constructor(private readonly repository: Repository<D>) {}

  public create(doc: object, saveOptions?: unknown): Promise<CreatedModel | D> {
    return this.repository.create(doc, saveOptions);
  }

  async createMany(
    docs: object[],
    insertManyOptions?: unknown,
  ): Promise<CreatedModel[] | D[]> {
    return this.repository.createMany(docs, insertManyOptions);
  }

  public find(filter: unknown, options?: unknown): Promise<D[]> {
    return this.repository.find(filter, options);
  }

  public findById(id: unknown): Promise<D | null> {
    return this.repository.findById(id);
  }

  public findAll(): Promise<D[]> {
    return this.repository.findAll();
  }

  public remove(filter: unknown): Promise<RemovedModel> {
    return this.repository.remove(filter);
  }

  public updateOne(
    filter: unknown,
    update: unknown,
    options?: unknown,
  ): Promise<UpdatedModel> {
    return this.repository.updateOne(filter, update, options);
  }

  public updateMany(
    filter: unknown,
    update: unknown,
    options?: unknown,
  ): Promise<UpdatedModel> {
    return this.repository.updateMany(filter, update, options);
  }

  public findOneAndUpdate(
    filter: unknown,
    update: unknown,
    options?: unknown,
  ): Promise<D | null> {
    return this.repository.findOneAndUpdate(filter, update, options);
  }

  public countAll(): Promise<number> {
    return this.repository.countAll();
  }

  public count(filter: unknown, options?: unknown): Promise<number> {
    return this.repository.count(filter, options);
  }
}
