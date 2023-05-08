import { Type } from '@nestjs/common';

export type SimpleRepositoryOutputObj<E extends object> = E;

export type SimpleRepositoryOutput<E extends object> = Type<
  SimpleRepositoryOutputObj<E>
>;
