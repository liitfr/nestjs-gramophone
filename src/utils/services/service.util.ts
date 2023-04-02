import { Type } from '@nestjs/common';

import { addSpaceToPascalCase } from '../string.util';

export const SERVICE_METADATA = Symbol('serviceMetadata');

export interface ServiceMetadata {
  serviceName?: string;
  serviceDescription?: string;
}

export const isServiceDecorated = (Service: Type) =>
  !!Reflect.getMetadata(SERVICE_METADATA, Service);

export const getServiceMetadata = (Service: Type): ServiceMetadata => {
  const serviceMetadata = Reflect.getMetadata(SERVICE_METADATA, Service);
  return {
    serviceName: Service.name,
    serviceDescription: addSpaceToPascalCase(Service.name),
    ...serviceMetadata,
  };
};
