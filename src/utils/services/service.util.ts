import { Type } from '@nestjs/common';

import { addSpaceToPascalCase } from '../string.util';

export const SERVICE_METADATA = Symbol('serviceMetadata');

export interface ServiceMetadata {
  serviceName?: string;
  serviceDescription?: string;
}

export const isServiceDecorated = (classRef: Type) =>
  !!Reflect.getMetadata(SERVICE_METADATA, classRef);

export const getServiceMetadata = (classRef: Type): ServiceMetadata => {
  const serviceMetadata = Reflect.getMetadata(SERVICE_METADATA, classRef);
  return {
    serviceName: classRef.name,
    serviceDescription: addSpaceToPascalCase(classRef.name),
    ...serviceMetadata,
  };
};
