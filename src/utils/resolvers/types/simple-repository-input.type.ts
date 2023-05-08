import { Type } from '@nestjs/common';

import { OptionalIds } from '../../types/optional-ids.type';

export type SimpleRepositoryInputObj<E extends object> = OptionalIds<E>;

export type PartialSimpleRepositoryInputObj<E extends object> = Partial<
  SimpleRepositoryInputObj<E>
>;

export type SimpleRepositoryInput<E extends object> = Type<
  SimpleRepositoryInputObj<E>
>;

export type PartialSimpleRepositoryInput<E extends object> = Type<
  PartialSimpleRepositoryInputObj<E>
>;
