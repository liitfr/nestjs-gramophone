import { ServiceMetadata, getServiceToken } from './service.util';
import { ServiceStore } from '../services/service-store.service';

export function SetServiceMetadata<E extends object>(
  metadata: Partial<ServiceMetadata<E>>,
) {
  return <T extends { new (...args: any[]): object }>(constructor: T) => {
    const serviceToken = getServiceToken(constructor);

    if (!serviceToken) {
      throw new Error('Service token not found');
    }

    const newMetadata = {
      ...(ServiceStore.uncertainGet(serviceToken) ?? {}),
      Service: constructor,
      ...metadata,
    } as ServiceMetadata<E>;

    ServiceStore.set<E>(serviceToken, newMetadata);

    return constructor;
  };
}
