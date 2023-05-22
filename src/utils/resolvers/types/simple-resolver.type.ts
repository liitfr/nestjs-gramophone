import { Type } from '@nestjs/common';

import { SimpleServiceObj } from '../../services/simple-service.type';

export type SimpleResolverObj<E extends object> = {
  simpleService: SimpleServiceObj<E>;
};

export type SimpleResolver<E extends object> = Type<SimpleResolverObj<E>>;
