import { SetMetadata } from '@nestjs/common';

import { ResolverOperationEnum } from '../enums/resolver-operation.enum';

export const RESOLVER_OPERATION: unique symbol = Symbol('resolverOperation');

export const SetResolverOperation = (
  resolverOperation: ResolverOperationEnum,
) => SetMetadata(RESOLVER_OPERATION, resolverOperation);
