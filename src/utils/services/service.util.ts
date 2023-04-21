import { Type } from '@nestjs/common';

export const SERVICE_METADATA = Symbol('serviceMetadata');

export interface ServiceMetadata<S extends object> {
  Service: Type<S>;
  serviceToken: symbol;
  serviceDescription?: string;
}

export const isServiceDecorated = (Service: Type<object>) =>
  !!Reflect.getMetadata(SERVICE_METADATA, Service);

export const getServiceToken = (Service: Type<object>): symbol | undefined => {
  const metadata = Reflect.getMetadata(SERVICE_METADATA, Service);
  return metadata?.serviceToken;
};
