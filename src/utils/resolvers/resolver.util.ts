export const resolverDescription = Symbol('resolverDescription');
export const resolverName = Symbol('resolverName');

export abstract class ResolverDecorator {
  static [resolverName]: string;
  static [resolverDescription]?: string;
}

export const isResolverDecorator = (object: any): object is ResolverDecorator =>
  !!Object.getOwnPropertyDescriptor(object, resolverName);

export const getResolverName = (object: any): string => {
  if (isResolverDecorator(object)) {
    const resolverNameValue = Object.getOwnPropertyDescriptor(
      object,
      resolverName,
    )?.value;
    if (!resolverNameValue) {
      throw new Error('Resolver name is not defined');
    }
    return resolverNameValue;
  }

  return object.name;
};

export const getResolverDescription = (object: any): string =>
  object[resolverDescription] ?? getResolverName(object);
