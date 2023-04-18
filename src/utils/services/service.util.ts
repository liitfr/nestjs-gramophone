import { Type } from '@nestjs/common';

export const SERVICE_METADATA = Symbol('serviceMetadata');

export interface ServiceMetadata {
  Service: Type<unknown>;
  serviceToken: symbol;
  serviceDescription?: string;
}

export const isServiceDecorated = (Service: Type) =>
  !!Reflect.getMetadata(SERVICE_METADATA, Service);

export const getServiceToken = (Service: Type): symbol | undefined => {
  const metadata = Reflect.getMetadata(SERVICE_METADATA, Service);
  return metadata?.serviceToken;
};
