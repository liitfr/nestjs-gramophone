import { Inject, SetMetadata, Type } from '@nestjs/common';
import { UserInputError } from 'apollo-server-express';

import { SimpleServiceFactory } from '../../utils/services/simple-service.factory';
import {
  REFERENCE_METADATA,
  ReferenceMetadata,
  getReferenceMetadata,
} from '../../utils/references/reference.util';
import { pascalCase } from '../../utils/string.util';

import { ReferencesService } from '../services/references.service';

export function SimpleReferenceServiceFactory(
  Reference: Type<unknown>,
  serviceName: string,
) {
  const referenceMetadata = getReferenceMetadata(Reference);

  const { referenceName, referenceDescription, ReferencePartitioner } =
    referenceMetadata;

  const SimpleService = SimpleServiceFactory(Reference);

  class SimpleReferenceService extends SimpleService {
    @Inject(ReferencesService)
    public readonly referencesService?: ReferencesService;

    public async findAllForAVersion(requestedVersion?: number) {
      let version = requestedVersion;
      if (!version) {
        const reference = (
          await this.referencesService.find({
            code: referenceName,
          })
        )?.[0];
        if (!reference) {
          throw new UserInputError('No reference for this version.', {
            service: 'simpleReferenceService',
            method: 'findAllForAVersion',
            version,
            userFriendly: "Il n'existe pas de référence pour cette version.",
          });
        }
        version = reference.version;
      }
      const result = await this.repository.find({ version }, { index: 1 });
      if (result.length === 0) {
        throw new UserInputError(
          'No ' + referenceDescription + ' for this version.',
          {
            service: 'simpleReferenceService',
            method: 'findAllForAVersion',
            version,
            userFriendly: "Il n'existe pas de référence pour cette version.",
          },
        );
      }
      return result;
    }

    public async findAllActive() {
      return await this.findAllForAVersion();
    }
  }

  Object.entries(ReferencePartitioner).forEach(([key]) => {
    const pCKey = pascalCase(key);

    Object.defineProperty(SimpleReferenceService.prototype, `find${pCKey}`, {
      value: async function () {
        return (await this.repository.find({ code: key }))?.[0];
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

  SetMetadata<symbol, ReferenceMetadata>(REFERENCE_METADATA, {
    ...referenceMetadata,
    referenceServiceName: serviceName,
  })(Reference);

  return SimpleReferenceService;
}
