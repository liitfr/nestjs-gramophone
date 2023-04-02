import { Inject, Injectable, Type } from '@nestjs/common';
import { UserInputError } from 'apollo-server-express';

import { Repository } from '../../data/abstracts/repository.abstract';
import { SimpleService } from '../../utils/services/simple.service';
import { getReferenceMetadata } from '../../utils/references/reference.util';
import { pascalCase, pluralize } from '../../utils/string.util';

import { ReferencesService } from '../services/references.service';

export function SimpleReferenceServiceFactory<D>(Reference: Type<unknown>) {
  const { referenceName, referenceDescription, referencePartitioner } =
    getReferenceMetadata(Reference);

  @Injectable()
  class SimpleReferenceService extends SimpleService<D> {
    constructor(readonly repository: Repository<D>) {
      super(repository);
    }

    @Inject(ReferencesService)
    readonly referencesService: ReferencesService;

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
  });

  Object.entries(referencePartitioner).forEach(([key]) => {
    const pCKey = pascalCase(key);
    SimpleReferenceService.prototype[`find${pCKey}`] = async function () {
      return (await this.repository.find({ code: key }))?.[0];
    };

    SimpleReferenceService.prototype[`find${pCKey}Id`] = async function () {
      return (await this[`find${pCKey}`]())?._id;
    };
  });

  return SimpleReferenceService;
}
