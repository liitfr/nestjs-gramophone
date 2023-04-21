import { Injectable, Type } from '@nestjs/common';

import { ServiceMetadata, getServiceToken } from './service.util';

@Injectable()
export class ServiceStore {
  private static services = new Map<symbol, ServiceMetadata<object>>();

  public static set<S extends object>(
    service: symbol | string | Type<S>,
    metadata: Partial<ServiceMetadata<S>>,
  ): ServiceMetadata<S> {
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
    ServiceStore.services.set(serviceToken, newMetadata as ServiceMetadata<S>);
    return newMetadata as ServiceMetadata<S>;
  }

  public static uncertainGet<S extends object>(
    service: symbol | string | Type<S>,
  ): ServiceMetadata<S> | undefined {
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
      return ServiceStore.services.get(serviceToken) as ServiceMetadata<S>;
    }
    return undefined;
  }

  public static has = (service: symbol | string | Type<object>): boolean =>
    !!ServiceStore.uncertainGet(service);

  public static get<S extends object>(
    service: symbol | string | Type<S>,
  ): ServiceMetadata<S> {
    const result = ServiceStore.uncertainGet(service);
    if (!result) {
      throw new Error('Service not found in ServiceStore.');
    }
    return result;
  }
}
