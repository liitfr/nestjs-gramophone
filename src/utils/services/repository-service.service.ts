import { Injectable } from '@nestjs/common';
import { Repository } from 'src/data/abstracts/repository.abstract';
import { serviceDescription } from './service.util';
import {
  CreatedModel,
  RemovedModel,
  UpdatedModel,
} from 'src/data/abstracts/operations.abstract';

@Injectable()
export abstract class RepositoryService<D> implements Repository<D> {
  constructor(private readonly repository: Repository<D>) {}

  static [serviceDescription] = 'Connected Service';

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
    updated: unknown,
    options?: unknown,
  ): Promise<UpdatedModel> {
    return this.repository.updateOne(filter, updated, options);
  }

  public updateMany(
    filter: unknown,
    updated: unknown,
    options?: unknown,
  ): Promise<UpdatedModel> {
    return this.repository.updateMany(filter, updated, options);
  }

  public countAll(): Promise<number> {
    return this.repository.countAll();
  }

  public count(filter: unknown, options: unknown): Promise<number> {
    return this.repository.count(filter, options);
  }
}
