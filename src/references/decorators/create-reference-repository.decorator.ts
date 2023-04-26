import { Schema as MongooseSchema } from 'mongoose';

import { RepositoryStore } from '../../data/services/repository-store.service';
import { Constructor } from '../../utils/types/constructor.type';

export function CreateReferenceRepository() {
  return <O extends object, C extends Constructor<O>>(constructor: C) => {
    RepositoryStore.register<O, MongooseSchema>(constructor, {
      SchemaTransformer: (Schema) =>
        Schema.index({ code: 1, version: 1 }, { unique: true }),
    });

    return constructor;
  };
}
