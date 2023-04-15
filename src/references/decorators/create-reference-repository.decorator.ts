import { Schema as MongooseSchema } from 'mongoose';

import { RepositoryStore } from '../../data/services/repository-store.service';

export function CreateReferenceRepository() {
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    RepositoryStore.register(constructor, {
      SchemaFactory: (Schema: MongooseSchema) =>
        Schema.index({ code: 1, version: 1 }, { unique: true }),
    });

    return constructor;
  };
}
