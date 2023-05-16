import { Type } from '@nestjs/common';

import {
  RemovedModel,
  UpdatedModel,
} from '../../data/abstracts/operations.abstract';
import { Repository } from '../../data/abstracts/repository.abstract';
import { VersionDataInput } from '../../versioning/dtos/version-data.input';

import { SimpleRepositoryInputObj } from '../resolvers/types/simple-repository-input.type';
import { SimpleRepositoryOutputObj } from '../resolvers/types/simple-repository-output.type';
import { Id } from '../types/id.type';

export type SimpleServiceObj<D extends object> = {
  repository: Repository<D>;

  create(_params: {
    doc: SimpleRepositoryInputObj<D>;
    versionData?: VersionDataInput;
    saveOptions?: unknown;
  }): Promise<SimpleRepositoryOutputObj<D>>;

  createMany(_params: {
    docs: SimpleRepositoryInputObj<D>[];
    versionData?: VersionDataInput;
    insertManyOptions?: unknown;
  }): Promise<SimpleRepositoryOutputObj<D>[]>;

  uncertainFind(_params: {
    filter: object;
    options?: unknown;
  }): Promise<SimpleRepositoryOutputObj<D>[]>;

  find(_params: {
    filter: object;
    options?: unknown;
  }): Promise<SimpleRepositoryOutputObj<D>[]>;

  uncertainFindById(_params: {
    id: Id;
  }): Promise<SimpleRepositoryOutputObj<D> | null>;

  findById(_params: { id: Id }): Promise<SimpleRepositoryOutputObj<D>>;

  findAll(): Promise<SimpleRepositoryOutputObj<D>[]>;

  remove(_params: { filter: object }): Promise<RemovedModel>;

  updateOne(_params: {
    filter: object;
    update: object;
    versionData?: VersionDataInput;
    options?: unknown;
  }): Promise<UpdatedModel>;

  updateMany(_params: {
    filter: object;
    update: object;
    versionData?: VersionDataInput;
    options?: unknown;
  }): Promise<UpdatedModel>;

  uncertainFindOneAndUpdate(_params: {
    filter: object;
    update: object;
    versionData?: VersionDataInput;
    options?: unknown;
  }): Promise<SimpleRepositoryOutputObj<D> | null>;

  findOneAndUpdate(_params: {
    filter: object;
    update: object;
    versionData?: VersionDataInput;
    options?: unknown;
  }): Promise<SimpleRepositoryOutputObj<D>>;

  countAll(): Promise<number>;

  count(_params: { filter: object; options?: unknown }): Promise<number>;
};

export type SimpleService<D extends object> = Type<SimpleServiceObj<D>>;
