import { Schema as MongooseSchema } from 'mongoose';

import { RepositoryStore } from '../../data/services/repository-store.service';
import { Constructor } from '../../utils/types/constructor.type';

export function CreateReferenceRepository() {
  return <T extends Constructor>(constructor: T) => {
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
