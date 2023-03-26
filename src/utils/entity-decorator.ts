export const entityName = Symbol('entityName');
export const entityDescription = Symbol('entityDescription');

export abstract class EntityDecorator {
  static [entityName]: string;
}

export const isEntityDecorator = (object: any): object is EntityDecorator => {
  return !!Object.getOwnPropertyDescriptor(object, entityName);
};

export const getEntityName = (object: any): string => {
  if (isEntityDecorator(object)) {
    return Object.getOwnPropertyDescriptor(object, entityName).value;
  }

  return object.name;
};

export const getEntityDescription = (object: any): string => {
  return object[entityDescription] ?? getEntityName(object);
};
