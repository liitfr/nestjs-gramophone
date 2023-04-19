import { Injectable, Type } from '@nestjs/common';

import { ServiceMetadata, getServiceToken } from './service.util';

@Injectable()
export class ServiceStore {
  private static services = new Map<symbol, ServiceMetadata>();

  public static set(
    service: symbol | string | Type,
    metadata: Partial<ServiceMetadata>,
  ): ServiceMetadata {
    let serviceToken: symbol | undefined;
    if (typeof service === 'string') {
      serviceToken = [...ServiceStore.services.keys()].find(
        (key) => key.description === service,
      );
    } else if (typeof service === 'symbol') {
      serviceToken = service;
    } else {
      const resolvedServiceToken = getServiceToken(service);
      if (!resolvedServiceToken) {
        throw new Error('Service not found');
      }
      serviceToken = resolvedServiceToken;
    }
    if (!serviceToken) {
      throw new Error('Service not found');
    }
    const existingMetadata = ServiceStore.services.get(serviceToken);
    const newMetadata = {
      ...existingMetadata,
      ...metadata,
    };
    if (!newMetadata.serviceToken || !newMetadata.Service) {
      throw new Error(
        `Service metadata not complete for ${service.toString()} : token : ${newMetadata.serviceToken?.toString()}`,
      );
    }
    ServiceStore.services.set(serviceToken, newMetadata as ServiceMetadata);
    return newMetadata as ServiceMetadata;
  }

  public static uncertainGet(
    service: symbol | string | Type,
  ): ServiceMetadata | undefined {
    let serviceToken: symbol | undefined;
    if (typeof service === 'string') {
      serviceToken = [...ServiceStore.services.keys()].find(
        (key) => key.description === service,
      );
    } else if (typeof service === 'symbol') {
      serviceToken = service;
    } else {
      const resolvedServiceToken = getServiceToken(service);
      if (resolvedServiceToken) {
        serviceToken = resolvedServiceToken;
      }
    }
    if (serviceToken) {
      return ServiceStore.services.get(serviceToken);
    }
    return undefined;
  }

  public static has = (service: symbol | string | Type): boolean =>
    !!ServiceStore.uncertainGet(service);

  public static get(service: symbol | string | Type): ServiceMetadata {
    const result = ServiceStore.uncertainGet(service);
    if (!result) {
      throw new Error('Service not found in ServiceStore.');
    }
    return result;
  }
}
