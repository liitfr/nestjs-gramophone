import { Injectable } from '@nestjs/common';

import { ServiceMetadata } from './service.util';

@Injectable()
export class ServiceStore {
  private static services = new Map<symbol, ServiceMetadata>();

  public static set(serviceToken: symbol, metadata: ServiceMetadata) {
    ServiceStore.services.set(serviceToken, metadata);
  }

  public static get(serviceToken: symbol) {
    return ServiceStore.services.get(serviceToken);
  }
}
