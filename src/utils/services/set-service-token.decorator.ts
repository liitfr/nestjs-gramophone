import { SetMetadata } from '@nestjs/common';

import { SERVICE_METADATA } from './service.util';

export function SetServiceToken(serviceToken: symbol | undefined) {
  return <T extends { new (...args: any[]): object }>(constructor: T) => {
    SetMetadata<symbol, { serviceToken: symbol }>(SERVICE_METADATA, {
      serviceToken: serviceToken ?? Symbol(constructor.name),
    })(constructor);
    return constructor;
  };
}
