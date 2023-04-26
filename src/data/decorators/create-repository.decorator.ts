import { Constructor } from '../../utils/types/constructor.type';

import {
  RepositoryStore,
  RepositoryStoreRegisterOptions,
} from '../services/repository-store.service';

export function CreateRepository<S>(
  options?: RepositoryStoreRegisterOptions<S>,
) {
  return <T extends Constructor>(constructor: T) => {
    RepositoryStore.register(constructor, options);

    return constructor;
  };
}
