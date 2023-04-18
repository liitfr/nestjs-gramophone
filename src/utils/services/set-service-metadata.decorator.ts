import { ServiceMetadata, getServiceToken } from './service.util';
import { ServiceStore } from '../services/service-store.service';

export function SetServiceMetadata(metadata: Partial<ServiceMetadata>) {
  return <T extends { new (...args: any[]): unknown }>(constructor: T) => {
    const serviceToken = getServiceToken(constructor);

    if (!serviceToken) {
      throw new Error('Service token not found');
    }

    const newMetadata = {
      ...(ServiceStore.uncertainGet(serviceToken) ?? {}),
      Service: constructor,
      ...metadata,
    };

    ServiceStore.set(serviceToken, newMetadata);

    return constructor;
  };
}
