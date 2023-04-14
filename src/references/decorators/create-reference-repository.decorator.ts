import { Schema as MongooseSchema } from 'mongoose';

import { registerRepository } from '../../data/decorators/create-repository.decorator';

export function CreateReferenceRepository() {
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    registerRepository(constructor, {
      SchemaFactory: (Schema: MongooseSchema) =>
        Schema.index({ code: 1, version: 1 }, { unique: true }),
    });

    return constructor;
  };
}
