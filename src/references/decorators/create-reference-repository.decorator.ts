import { Schema as MongooseSchema } from 'mongoose';

import { RepositoryStore } from '../../data/services/repository-store.service';

export function CreateReferenceRepository() {
  return <T extends { new (...args: any[]): object }>(constructor: T) => {
    RepositoryStore.register(constructor, {
      SchemaFactory: (Schema) =>
        (Schema as MongooseSchema).index(
          // FIXME: use of `as MongooseSchema` shows a lack of design
          // shall we use generic repository store with DI for mongo ?
          { code: 1, version: 1 },
          { unique: true },
        ),
    });

    return constructor;
  };
}
