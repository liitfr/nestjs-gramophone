import { SimpleServiceObj } from '../../services/simple-service.factory';

export type BaseResolver<E> = {
  simpleService: SimpleServiceObj<E>;
};
