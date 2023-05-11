import { Inject, Type } from '@nestjs/common';

import {
  SimpleServiceFactory,
  SimpleServiceObj,
} from '../../utils/services/simple-service.factory';
import { pascalCase, pluralize } from '../../utils/string.util';
import { CustomError, ErrorCode } from '../../utils/errors/custom.error';
import { SetServiceMetadata } from '../../utils/services/set-service-metadata.decorator';
import { EntityStore } from '../../utils/entities/entity-store.service';
import { SetEntityMetadata } from '../../utils/entities/set-entity-metadata.decorator';

import { ReferencesService } from '../services/references.service';
import { ISimpleReference } from '../decorators/simple-reference.decorator';
import { Repository } from '../../data/abstracts/repository.abstract';

type SimpleReferenceServiceObj<
  D extends object,
  E extends Record<string, string>,
> = SimpleServiceObj<D> & {
  referencesService: ReferencesService;
  findAllForAVersion: (requestedVersion?: number) => Promise<D[]>;
  findAllActive: () => Promise<D[]>;
} & {
  [K in keyof E as `find${Capitalize<K & string>}`]: () => Promise<D>;
};

type SimpleReferenceService<
  D extends object,
  E extends Record<string, string>,
> = Type<SimpleReferenceServiceObj<D, E>>;

interface Return<R extends object, E extends Record<string, string>> {
  Service: SimpleReferenceService<R, E>;
  serviceToken: symbol;
}

export const SimpleReferenceServiceFactory = <
  R extends ISimpleReference,
  E extends Record<string, string>,
>(
  Reference: Type<R>,
): Return<R, E> => {
  const entityMetadata = EntityStore.get(Reference);

  const { entityToken, entityDescription, EntityPartition, entityPartitioner } =
    entityMetadata;

  const entityTokenDescription = entityToken.description;

  if (!entityTokenDescription) {
    throw new Error('Entity token description not found.');
  }

  const { Service } = SimpleServiceFactory(Reference);

  class SimpleReferenceService extends Service {
    @Inject(ReferencesService)
    public readonly referencesService: ReferencesService;

    public async findAllForAVersion(requestedVersion?: number) {
      let version = requestedVersion;
      if (!version) {
        const reference = (
          await this.referencesService.find({
            code: entityTokenDescription,
          })
        )?.[0];
        if (!reference) {
          throw new CustomError(
            'No reference for this version.',
            ErrorCode.NOT_FOUND,
            {
              fr: "Il n'existe pas de référence pour cette version.",
            },
            {
              service: 'simpleReferenceService',
              method: 'findAllForAVersion',
              version,
            },
          );
        }
        version = reference.version;
      }

      // HACK : typing isn't correct if we don't cast.
      // FIXME : find a better way to do this.
      const result = await (
        this.repository as Repository<ISimpleReference>
      ).find({ version }, { index: 1 });

      if (result.length === 0) {
        throw new CustomError(
          `No ${entityDescription} for this version.`,
          ErrorCode.NOT_FOUND,
          {
            fr: "Il n'existe pas de référence pour cette version.",
          },
          {
            service: 'simpleReferenceService',
            method: 'findAllForAVersion',
            version,
          },
        );
      }

      // HACK : typing isn't correct if we don't cast.
      // FIXME : find a better way to do this.
      return result as R[];
    }

    public async findAllActive() {
      return await this.findAllForAVersion();
    }
  }

  if (
    (!EntityPartition && entityPartitioner) ||
    (EntityPartition && !entityPartitioner)
  ) {
    throw new Error(
      'EntityPartition and entityPartitioner must be both defined or both undefined.',
    );
  }

  Object.entries(EntityPartition ?? []).forEach(([key]) => {
    const pCKey = pascalCase(key);

    if (!entityPartitioner) {
      throw new Error('Entity partitioner not found.');
    }

    Object.defineProperty(SimpleReferenceService.prototype, `find${pCKey}`, {
      value: async function () {
        return (await this.repository.find({ [entityPartitioner]: key }))?.[0];
      },
      writable: true,
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(SimpleReferenceService.prototype, `find${pCKey}Id`, {
      value: async function () {
        return (await this[`find${pCKey}`]())?._id;
      },
      writable: true,
      enumerable: true,
      configurable: true,
    });
  });

  const serviceToken: unique symbol = Symbol(
    `${pluralize(pascalCase(entityTokenDescription))}Service`,
  );

  SetServiceMetadata({
    serviceToken,
  })(SimpleReferenceService);

  SetEntityMetadata({
    entityToken,
    entityServiceToken: serviceToken,
  })(Reference);

  return {
    Service: SimpleReferenceService as Type<SimpleReferenceServiceObj<R, E>>,
    serviceToken,
  };
};
