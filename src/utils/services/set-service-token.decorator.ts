import { SetMetadata } from '@nestjs/common';

import { Constructor } from '../types/constructor.type';

import { SERVICE_METADATA } from './service.util';

export function SetServiceToken(serviceToken: symbol | undefined) {
  return <T extends Constructor>(constructor: T) => {
    SetMetadata<symbol, { serviceToken: symbol }>(SERVICE_METADATA, {
      serviceToken: serviceToken ?? Symbol(constructor.name),
    })(constructor);
    return constructor;
  };
}
