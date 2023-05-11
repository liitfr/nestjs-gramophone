import { Type } from '@nestjs/common';

// Output should be equivalent to Entity
// TODO : Check use of HydratedDocument, that is more accurate

export type SimpleRepositoryOutputObj<E extends object> = E;

export type SimpleRepositoryOutput<E extends object> = Type<
  SimpleRepositoryOutputObj<E>
>;
