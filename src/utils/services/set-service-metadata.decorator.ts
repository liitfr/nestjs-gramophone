import { SetMetadata } from '@nestjs/common';

import { SERVICE_METADATA, ServiceMetadata } from './service.util';
import { ServiceStore } from './service-store.service';

export function SetServiceMetadata(metadata: ServiceMetadata) {
  const { serviceToken } = metadata;

  const newMetadata = {
    ...(ServiceStore.get(serviceToken) ?? {}),
    ...metadata,
  };

  ServiceStore.set(serviceToken, newMetadata);

  return SetMetadata<symbol, ServiceMetadata>(SERVICE_METADATA, newMetadata);
}
