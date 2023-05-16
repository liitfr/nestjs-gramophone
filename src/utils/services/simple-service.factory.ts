import { Inject, Logger, Type } from '@nestjs/common';

import { Repository } from '../../data/abstracts/repository.abstract';
import {
  RemovedModel,
  UpdatedModel,
} from '../../data/abstracts/operations.abstract';
import { SaveVersionIfEnabled } from '../../versioning/decorators/save-version-if-enabled.decorator';
import { VersionDataInput } from '../../versioning/dtos/version-data.input';

import { EntityStore } from '../entities/entity-store.service';
import { Id } from '../types/id.type';
import {
  PartialSimpleRepositoryInputObj,
  SimpleRepositoryInputObj,
} from '../resolvers/types/simple-repository-input.type';
import { SimpleRepositoryOutputObj } from '../resolvers/types/simple-repository-output.type';

import { SetServiceMetadata } from './set-service-metadata.decorator';
import { getServiceToken } from './service.util';
import { SetServiceToken } from './set-service-token.decorator';
import { SimpleService } from './simple-service.type';

interface Return<E extends object> {
  Service: SimpleService<E>;
  serviceToken: symbol;
}

export const SimpleServiceFactory = <E extends object>(
  Entity: Type<E>,
): Return<E> => {
  const entityMetadata = EntityStore.get(Entity);

  const { entityToken, entityRepositoryToken, entityServiceToken } =
    entityMetadata;

  const entityTokenDescription = entityToken.description;

  if (!entityTokenDescription) {
    throw new Error(
      `Description not found for token ${entityToken.toString()}`,
    );
  }

  if (!entityServiceToken) {
    throw new Error(
      `Service token not found for entity ${entityTokenDescription}`,
    );
  }

  if (!entityRepositoryToken) {
    throw new Error(
      `Repository token not found for entity ${entityTokenDescription}`,
    );
  }

  Logger.verbose(
    `SimpleService for ${entityTokenDescription}`,
    'SimpleServiceFactory',
  );

  class SimpleService<D extends object> implements Repository<D> {
    @Inject(entityRepositoryToken)
    public readonly repository!: Repository<D>;

    @SaveVersionIfEnabled()
    public create({
      doc,
      saveOptions,
    }: {
      doc: SimpleRepositoryInputObj<D>;
      versionData?: VersionDataInput;
      saveOptions?: unknown;
    }): Promise<SimpleRepositoryOutputObj<D>> {
      return this.repository.create({ doc, saveOptions });
    }

    @SaveVersionIfEnabled()
    async createMany({
      docs,
      insertManyOptions,
    }: {
      docs: SimpleRepositoryInputObj<D>[];
      versionData?: VersionDataInput;
      insertManyOptions?: unknown;
    }): Promise<SimpleRepositoryOutputObj<D>[]> {
      return this.repository.createMany({ docs, insertManyOptions });
    }

    async uncertainFind({
      filter,
      options,
    }: {
      filter: PartialSimpleRepositoryInputObj<D>;
      options?: unknown;
    }): Promise<SimpleRepositoryOutputObj<D>[]> {
      return this.repository.uncertainFind({ filter, options });
    }

    async find({
      filter,
      options,
    }: {
      filter: PartialSimpleRepositoryInputObj<D>;
      options?: unknown;
    }): Promise<SimpleRepositoryOutputObj<D>[]> {
      return this.repository.find({ filter, options });
    }

    async uncertainFindById({
      id,
    }: {
      id: Id;
    }): Promise<SimpleRepositoryOutputObj<D> | null> {
      return this.repository.uncertainFindById({ id });
    }

    async findById({ id }: { id: Id }): Promise<SimpleRepositoryOutputObj<D>> {
      return this.repository.findById({ id });
    }

    async findAll(): Promise<SimpleRepositoryOutputObj<D>[]> {
      return this.repository.findAll();
    }

    async remove({
      filter,
    }: {
      filter: PartialSimpleRepositoryInputObj<D>;
    }): Promise<RemovedModel> {
      return this.repository.remove({ filter });
    }

    @SaveVersionIfEnabled()
    async updateOne({
      filter,
      update,
      options,
    }: {
      filter: PartialSimpleRepositoryInputObj<D>;
      update: PartialSimpleRepositoryInputObj<D>;
      versionData?: VersionDataInput;
      options?: unknown;
    }): Promise<UpdatedModel> {
      return this.repository.updateOne({ filter, update, options });
    }

    @SaveVersionIfEnabled()
    async updateMany({
      filter,
      update,
      options,
    }: {
      filter: PartialSimpleRepositoryInputObj<D>;
      update: PartialSimpleRepositoryInputObj<D>;
      versionData?: VersionDataInput;
      options?: unknown;
    }): Promise<UpdatedModel> {
      return this.repository.updateMany({ filter, update, options });
    }

    @SaveVersionIfEnabled()
    async uncertainFindOneAndUpdate({
      filter,
      update,
      options,
    }: {
      filter: PartialSimpleRepositoryInputObj<D>;
      update: PartialSimpleRepositoryInputObj<D>;
      versionData?: VersionDataInput;
      options?: unknown;
    }): Promise<SimpleRepositoryOutputObj<D> | null> {
      return this.repository.uncertainFindOneAndUpdate({
        filter,
        update,
        options,
      });
    }

    @SaveVersionIfEnabled()
    async findOneAndUpdate({
      filter,
      update,
      options,
    }: {
      filter: PartialSimpleRepositoryInputObj<D>;
      update: PartialSimpleRepositoryInputObj<D>;
      versionData?: VersionDataInput;
      options?: unknown;
    }): Promise<SimpleRepositoryOutputObj<D>> {
      return this.repository.findOneAndUpdate({ filter, update, options });
    }

    async countAll(): Promise<number> {
      return this.repository.countAll();
    }

    async count({
      filter,
      options,
    }: {
      filter: PartialSimpleRepositoryInputObj<E>;
      options?: unknown;
    }): Promise<number> {
      return this.repository.count({ filter, options });
    }
  }

  if (!getServiceToken(SimpleService)) {
    SetServiceToken(entityServiceToken)(SimpleService);
  }

  SetServiceMetadata({
    serviceToken: entityServiceToken,
  })(SimpleService);

  return {
    Service: SimpleService,
    serviceToken: entityServiceToken,
  };
};
