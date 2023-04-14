import { SetMetadata } from '@nestjs/common';

import { SERVICE_METADATA, ServiceMetadata } from './service.util';

export const entities = new Map<symbol, ServiceMetadata>();

export function SetServiceMetadata(metadata: ServiceMetadata) {
  const { serviceToken } = metadata;

  const newMetadata = {
    ...(entities.get(serviceToken) ?? {}),
    ...metadata,
  };

  entities.set(serviceToken, newMetadata);

  return SetMetadata<symbol, ServiceMetadata>(SERVICE_METADATA, newMetadata);
}
