export const serviceDescription = Symbol('serviceDescription');
export const serviceName = Symbol('serviceName');

export abstract class ServiceDecorator {
  static [serviceName]: string;
  static [serviceDescription]?: string;
}

export const isServiceDecorator = (object: any): object is ServiceDecorator =>
  !!Object.getOwnPropertyDescriptor(object, serviceName);

export const getServiceName = (object: any): string => {
  if (isServiceDecorator(object)) {
    const serviceNameValue = Object.getOwnPropertyDescriptor(
      object,
      serviceName,
    )?.value;
    if (!serviceNameValue) {
      throw new Error('Service name is not defined');
    }
    return serviceNameValue;
  }

  return object.name;
};

export const getServiceDescription = (object: any): string =>
  object[serviceDescription] ?? getServiceName(object);
