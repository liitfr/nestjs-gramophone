import { SimpleServiceObj } from '../../services/simple-service.factory';

export type SimpleResolver<E extends object> = {
  simpleService: SimpleServiceObj<E>;
};
