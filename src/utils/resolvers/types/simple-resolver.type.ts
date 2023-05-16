import { SimpleServiceObj } from '../../services/simple-service.type';

export type SimpleResolver<E extends object> = {
  simpleService: SimpleServiceObj<E>;
};
