import { SimpleServiceObj } from '../../services/simple-service.factory';

export type SimpleResolver<E> = {
  simpleService: SimpleServiceObj<E>;
};
