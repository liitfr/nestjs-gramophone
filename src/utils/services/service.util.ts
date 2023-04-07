import { Type } from '@nestjs/common';

import { addSpaceToPascalCase } from '../string.util';

export const SERVICE_METADATA = Symbol('serviceMetadata');

export interface ServiceMetadata {
  serviceToken: symbol;
  serviceDescription?: string;
}

export const isServiceDecorated = (Service: Type) =>
  !!Reflect.getMetadata(SERVICE_METADATA, Service);

export const getServiceMetadata = (Service: Type): ServiceMetadata => {
  const serviceMetadata = Reflect.getMetadata(SERVICE_METADATA, Service);
  return {
    serviceDescription: addSpaceToPascalCase(Service.name),
    ...serviceMetadata,
  };
};
