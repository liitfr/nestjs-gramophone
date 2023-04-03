import {
  Inject,
  Injectable,
  SetMetadata,
  Type,
  // forwardRef,
} from '@nestjs/common';
import { UserInputError } from 'apollo-server-express';

import { Repository } from '../../data/abstracts/repository.abstract';
import { SimpleServiceFactory } from '../../utils/services/simple-service.factory';
import {
  REFERENCE_METADATA,
  ReferenceMetadata,
  getReferenceMetadata,
} from '../../utils/references/reference.util';
import { pascalCase, pluralize } from '../../utils/string.util';

import { ReferencesService } from '../services/references.service';

export function SimpleReferenceServiceFactory<D>(
  Reference: Type<unknown>,
  Repo: Type<Repository<D>>,
) {
  const referenceMetadata = getReferenceMetadata(Reference);

  const { referenceName, referenceDescription, ReferencePartitioner } =
    referenceMetadata;

  @Injectable()
  class SimpleReferenceService extends SimpleServiceFactory<D>(
    Reference,
    Repo,
  ) {
    constructor(
      // @Inject(forwardRef(() => ReferencesService))
      @Inject(ReferencesService)
      readonly referencesService: ReferencesService,
      @Inject(Repo)
      readonly repo: Repository<D>,
    ) {
      super(repo);
    }

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

  Object.defineProperty(SimpleReferenceService, 'name', {
    value: `${pascalCase(pluralize(referenceName))}Service`,
    writable: true,
    enumerable: true,
    configurable: true,
  });

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
    ReferenceService: SimpleReferenceService,
  })(Reference);

  return SimpleReferenceService;
}
