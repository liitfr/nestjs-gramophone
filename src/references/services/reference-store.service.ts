import { Injectable } from '@nestjs/common';

import { ReferenceMetadata } from '../utils/reference.util';

@Injectable()
export class ReferenceStore {
  private static references = new Map<symbol, ReferenceMetadata>();

  public static set(referenceToken: symbol, metadata: ReferenceMetadata) {
    ReferenceStore.references.set(referenceToken, metadata);
  }

  public static get(referenceToken: symbol) {
    return ReferenceStore.references.get(referenceToken);
  }
}
