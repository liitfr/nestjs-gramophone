import { Type } from '@nestjs/common';

export const SERVICE_METADATA: unique symbol = Symbol('serviceMetadata');

export interface ServiceMetadata<S extends object> {
  Service: Type<S>;
  serviceToken: symbol;
  serviceDescription?: string;
  isVersioned?: boolean;
}

export const isServiceDecorated = (Service: Type<object>) =>
  !!Reflect.getMetadata(SERVICE_METADATA, Service);

export const getServiceToken = (Service: Type<object>): symbol | undefined => {
  const metadata = Reflect.getMetadata(SERVICE_METADATA, Service);
  return metadata?.serviceToken;
};
