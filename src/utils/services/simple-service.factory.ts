import { Inject, SetMetadata, Type } from '@nestjs/common';
import { HydratedDocument } from 'mongoose';

import { Repository } from '../../data/abstracts/repository.abstract';
import {
  CreatedModel,
  RemovedModel,
  UpdatedModel,
} from '../../data/abstracts/operations.abstract';
import { SaveVersionIfEnabled } from '../../versioning/decorators/save-version-if-enabled.decorator';

import {
  ENTITY_METADATA,
  EntityMetadata,
  getEntityMetadata,
} from '../entities/entity.util';
import { camelCase, pascalCase, pluralize } from '../string.util';
import { getReferenceMetadata } from '../references/reference.util';

type SimpleServiceObj<D> = Repository<D> & {
  repository: Repository<D>;
};

type SimpleService<D> = Type<SimpleServiceObj<D>>;

export const SimpleServiceFactory = <E, D = HydratedDocument<E>>(
  Entity: Type<E>,
): SimpleService<D> => {
  const entityMetadata = getEntityMetadata(Entity);
  const { entityName, entityReferences } = entityMetadata;

  class SimpleService<D> implements Repository<D> {
    @Inject(`${pluralize(pascalCase(entityName))}Repository`)
    public readonly repository: Repository<D>;

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

    async find(filter: unknown, options?: unknown): Promise<D[]> {
      return this.repository.find(filter, options);
    }

    async findById(id: unknown): Promise<D | null> {
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
    async findOneAndUpdate(
      filter: unknown,
      update: unknown,
      options?: unknown,
    ): Promise<D | null> {
      return this.repository.findOneAndUpdate(filter, update, options);
    }

    async countAll(): Promise<number> {
      return this.repository.countAll();
    }

    async count(filter: unknown, options?: unknown): Promise<number> {
      return this.repository.count(filter, options);
    }
  }

  if (entityReferences && entityReferences.length) {
    entityReferences.forEach((reference) => {
      const { Reference, idName, partitionQueries } = reference;

      if (partitionQueries) {
        const { ReferencePartitioner, referenceName, referenceServiceName } =
          getReferenceMetadata(Reference);
        const referenceServicePropertyName = camelCase(referenceServiceName);

        if (!SimpleService[referenceServicePropertyName]) {
          Object.defineProperty(
            SimpleService.prototype,
            referenceServicePropertyName,
            {
              writable: true,
              enumerable: true,
              configurable: true,
            },
          );

          const referenceServiceInjector = Inject(referenceServiceName);
          referenceServiceInjector(
            SimpleService.prototype,
            referenceServicePropertyName,
          );
        }

        const pCReferenceName = pascalCase(referenceName);

        Object.entries(ReferencePartitioner).forEach(([key]) => {
          const pCPartitioner = pascalCase(key);

          Object.defineProperty(
            SimpleService.prototype,
            `findAllWith${pCPartitioner}${pCReferenceName}`,
            {
              value: async function () {
                const partitionerId = (
                  await this[referenceServicePropertyName].find({
                    code: key,
                  })
                )?.[0]?._id;
                return this.find({ [idName]: partitionerId });
              },
              writable: true,
              enumerable: true,
              configurable: true,
            },
          );

          Object.defineProperty(
            SimpleService.prototype,
            `countAllWith${pCPartitioner}${pCReferenceName}`,
            {
              value: async function () {
                const partitionerId = (
                  await this[referenceServicePropertyName].find({ code: key })
                )?.[0]?._id;
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

  SetMetadata<symbol, EntityMetadata>(ENTITY_METADATA, {
    ...entityMetadata,
    EntityService: SimpleService,
  })(Entity);

  return SimpleService;
};
