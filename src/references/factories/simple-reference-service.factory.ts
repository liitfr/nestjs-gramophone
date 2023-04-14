import { Inject, Type } from '@nestjs/common';

import { SimpleServiceFactory } from '../../utils/services/simple-service.factory';
import { pascalCase, pluralize } from '../../utils/string.util';
import { CustomError, ErrorCode } from '../../utils/errors/custom.error';
import { getEntityMetadata } from '../../utils/entities/entity.util';
import { SetEntityMetadata } from '../../utils/entities/set-entity-metadata.decorator';
import { SetServiceMetadata } from '../../utils/services/set-service-metadata.decorator';

import { ReferencesService } from '../services/references.service';

export function SimpleReferenceServiceFactory(Reference: Type<unknown>) {
  const entityMetadata = getEntityMetadata(Reference);

  const { entityToken, entityDescription, EntityPartition, entityPartitioner } =
    entityMetadata;

  const { Service } = SimpleServiceFactory(Reference);

  class SimpleReferenceService extends Service {
    @Inject(ReferencesService)
    public readonly referencesService?: ReferencesService;

    public async findAllForAVersion(requestedVersion?: number) {
      let version = requestedVersion;
      if (!version) {
        const reference = (
          await this.referencesService.find({
            code: entityToken.description,
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
      const result = await this.repository.find({ version }, { index: 1 });
      if (result.length === 0) {
        throw new CustomError(
          'No ' + entityDescription + ' for this version.',
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
      return result;
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

  const serviceToken = Symbol(
    `${pluralize(pascalCase(entityToken.description))}Service`,
  );

  SetServiceMetadata({
    serviceToken,
  })(SimpleReferenceService);

  SetEntityMetadata({
    entityToken,
    entityServiceToken: serviceToken,
  })(Reference);

  return {
    Service: SimpleReferenceService,
    serviceToken,
  };
}
