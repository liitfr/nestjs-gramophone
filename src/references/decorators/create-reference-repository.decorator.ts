import { Schema as MongooseSchema } from 'mongoose';

import { getEntityMetadata } from '../../utils/entities/entity.util';
import { registerRepository } from '../../data/decorators/create-repository.decorator';

export function CreateReferenceRepository() {
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const { entityToken, entityRepositoryToken } =
      getEntityMetadata(constructor);

    registerRepository(constructor, entityToken, entityRepositoryToken, {
      SchemaFactory: (Schema: MongooseSchema) =>
        Schema.index({ code: 1, version: 1 }, { unique: true }),
    });

    return constructor;
  };
}
