import { Injectable, Type } from '@nestjs/common';

import { ReferenceMetadata, getReferenceToken } from '../utils/reference.util';

@Injectable()
export class ReferenceStore {
  private static references = new Map<symbol, ReferenceMetadata>();

  public static set(
    reference: symbol | string | Type<unknown>,
    metadata: Partial<ReferenceMetadata>,
  ): ReferenceMetadata {
    let referenceToken: symbol | undefined;
    if (typeof reference === 'string') {
      referenceToken = [...ReferenceStore.references.keys()].find(
        (key) => key.description === reference,
      );
    } else if (typeof reference === 'symbol') {
      referenceToken = reference;
    } else {
      const resolvedReferenceToken = getReferenceToken(reference);
      if (!resolvedReferenceToken) {
        throw new Error('Reference not found');
      }
      referenceToken = resolvedReferenceToken;
    }
    if (!referenceToken) {
      throw new Error('Reference not found');
    }
    const existingMetadata = ReferenceStore.references.get(referenceToken);
    const newMetadata = {
      ...existingMetadata,
      ...metadata,
    };
    if (!newMetadata.referenceToken || !newMetadata.Reference) {
      throw new Error(
        `Reference metadata not complete for ${reference.toString()} : token : ${newMetadata.referenceToken?.toString()}`,
      );
    }
    ReferenceStore.references.set(
      referenceToken,
      newMetadata as ReferenceMetadata,
    );
    return newMetadata as ReferenceMetadata;
  }

  public static uncertainGet(
    reference: symbol | string | Type<unknown>,
  ): ReferenceMetadata | undefined {
    let referenceToken: symbol | undefined;
    if (typeof reference === 'string') {
      referenceToken = [...ReferenceStore.references.keys()].find(
        (key) => key.description === reference,
      );
    } else if (typeof reference === 'symbol') {
      referenceToken = reference;
    } else {
      const resolvedReferenceToken = getReferenceToken(reference);
      if (resolvedReferenceToken) {
        referenceToken = resolvedReferenceToken;
      }
    }
    if (referenceToken) {
      return ReferenceStore.references.get(referenceToken);
    }
    return undefined;
  }

  public static has = (reference: symbol | string | Type<unknown>): boolean =>
    !!ReferenceStore.uncertainGet(reference);

  public static get(
    reference: symbol | string | Type<unknown>,
  ): ReferenceMetadata {
    const result = ReferenceStore.uncertainGet(reference);
    if (!result) {
      throw new Error(
        `Reference not found in ReferenceStore : ${reference.toString()}`,
      );
    }
    return result;
  }
}
