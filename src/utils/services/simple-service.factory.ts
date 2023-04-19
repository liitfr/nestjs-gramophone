import { Inject, Logger, Type } from '@nestjs/common';

import { Repository } from '../../data/abstracts/repository.abstract';
import {
  CreatedModel,
  RemovedModel,
  UpdatedModel,
} from '../../data/abstracts/operations.abstract';
import { SaveVersionIfEnabled } from '../../versioning/decorators/save-version-if-enabled.decorator';

import { camelCase, pascalCase } from '../string.util';
import { EntityStore } from '../entities/entity-store.service';

import { SetServiceMetadata } from './set-service-metadata.decorator';
import { getServiceToken } from './service.util';
import { SetServiceToken } from './set-service-token.decorator';

type SimpleServiceObj<D> = Repository<D> & {
  repository: Repository<D>;
};

type SimpleService<D> = Type<SimpleServiceObj<D>>;

interface Return<E> {
  Service: SimpleService<E>;
  serviceToken: symbol;
}

export const SimpleServiceFactory = <E>(Entity: Type<E>): Return<E> => {
  const entityMetadata = EntityStore.get(Entity);

  const {
    entityToken,
    entityRelations,
    entityRepositoryToken,
    entityServiceToken,
  } = entityMetadata;

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

  class SimpleService<D> implements Repository<D> {
    @Inject(entityRepositoryToken)
    public readonly repository!: Repository<D>;

    @SaveVersionIfEnabled()
    public create(
      doc: object,
      saveOptions?: unknown,
    ): Promise<CreatedModel | D> {
      return this.repository.create(doc, saveOptions);
    }

    @SaveVersionIfEnabled()
    async createMany(
      docs: object[],
      insertManyOptions?: unknown,
    ): Promise<CreatedModel[] | D[]> {
      return this.repository.createMany(docs, insertManyOptions);
    }

    async uncertainFind(filter: unknown, options?: unknown): Promise<D[]> {
      return this.repository.uncertainFind(filter, options);
    }

    async find(filter: unknown, options?: unknown): Promise<D[]> {
      return this.repository.find(filter, options);
    }

    async uncertainFindById(id: unknown): Promise<D | null> {
      return this.repository.uncertainFindById(id);
    }

    async findById(id: unknown): Promise<D> {
      return this.repository.findById(id);
    }

    async findAll(): Promise<D[]> {
      return this.repository.findAll();
    }

    @SaveVersionIfEnabled()
    async remove(filter: unknown): Promise<RemovedModel> {
      return this.repository.remove(filter);
    }

    @SaveVersionIfEnabled()
    async updateOne(
      filter: unknown,
      update: unknown,
      options?: unknown,
    ): Promise<UpdatedModel> {
      return this.repository.updateOne(filter, update, options);
    }

    @SaveVersionIfEnabled()
    async updateMany(
      filter: unknown,
      update: unknown,
      options?: unknown,
    ): Promise<UpdatedModel> {
      return this.repository.updateMany(filter, update, options);
    }

    @SaveVersionIfEnabled()
    async uncertainFindOneAndUpdate(
      filter: unknown,
      update: unknown,
      options?: unknown,
    ): Promise<D | null> {
      return this.repository.uncertainFindOneAndUpdate(filter, update, options);
    }

    @SaveVersionIfEnabled()
    async findOneAndUpdate(
      filter: unknown,
      update: unknown,
      options?: unknown,
    ): Promise<D> {
      return this.repository.findOneAndUpdate(filter, update, options);
    }

    async countAll(): Promise<number> {
      return this.repository.countAll();
    }

    async count(filter: unknown, options?: unknown): Promise<number> {
      return this.repository.count(filter, options);
    }
  }

  if (entityRelations && entityRelations.length) {
    entityRelations.forEach((relation) => {
      const { target, details } = relation;

      const { partitionQueries, multiple, idName } = details;

      if (partitionQueries) {
        const {
          entityToken: relationToken,
          entityPartitioner: relationPartitioner,
          EntityPartition: RelationPartition,
          entityServiceToken: relationServiceName,
        } = EntityStore.get(target);

        const relationTokenDescription = relationToken.description;

        if (!relationTokenDescription) {
          throw new Error(
            `Description not found for token ${relationToken.toString()}`,
          );
        }

        if (!RelationPartition || !relationPartitioner) {
          throw new Error(
            `The entity ${relationTokenDescription} does not have a partitioner`,
          );
        }

        if (!relationServiceName) {
          throw new Error(
            `The entity ${relationTokenDescription} does not have a service`,
          );
        }

        const relationServicePropertyName = camelCase(
          relationServiceName.description,
        ) as keyof typeof SimpleService;

        if (!SimpleService[relationServicePropertyName]) {
          Object.defineProperty(
            SimpleService.prototype,
            relationServicePropertyName,
            {
              writable: true,
              enumerable: true,
              configurable: true,
            },
          );

          const relationServiceInjector = Inject(relationServiceName);
          relationServiceInjector(
            SimpleService.prototype,
            relationServicePropertyName,
          );
        }

        const pCRelationName = pascalCase(relationTokenDescription);

        Object.entries(RelationPartition).forEach(([key]) => {
          const pCPartition = pascalCase(key);

          Object.defineProperty(
            SimpleService.prototype,
            `findAllWith${pCPartition}${pCRelationName}`,
            {
              value: async function () {
                const partitionerId = (
                  await this[relationServicePropertyName].find({
                    [relationPartitioner]: key,
                  })
                )?.[0]?._id;
                if (multiple) {
                  return this.find({ [idName]: { $in: [partitionerId] } });
                }
                return this.find({ [idName]: partitionerId });
              },
              writable: true,
              enumerable: true,
              configurable: true,
            },
          );

          Object.defineProperty(
            SimpleService.prototype,
            `countAllWith${pCPartition}${pCRelationName}`,
            {
              value: async function () {
                const partitionerId = (
                  await this[relationServicePropertyName].find({
                    [relationPartitioner]: key,
                  })
                )?.[0]?._id;
                if (multiple) {
                  return this.count({ [idName]: { $in: [partitionerId] } });
                }
                return this.count({ [idName]: partitionerId });
              },
              writable: true,
              enumerable: true,
              configurable: true,
            },
          );
        });
      }
    });
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
