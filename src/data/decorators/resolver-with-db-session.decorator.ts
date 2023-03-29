import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';

import { DbSessionInterceptor } from '../interceptors/db-session.interceptor';

// WARNING : DbSessionInterceptor needs to set fieldResolverEnhancers in app.module if you use it with @FieldResolver
// It's best to use DbSessionPlugin
export function ResolverWithDbSession(resolverParams?: any) {
  return applyDecorators(
    Resolver(resolverParams),
    UseInterceptors(DbSessionInterceptor),
  );
}
