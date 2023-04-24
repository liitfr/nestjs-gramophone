import { APP_GUARD, Reflector } from '@nestjs/core';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard as AuthenticationGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

import { environment } from '../../environments/environment';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
class JwtAuthenticationGuardClass extends AuthenticationGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const gqlReq = ctx.getContext().req;
    if (gqlReq) {
      return gqlReq;
    }
    return context.switchToHttp().getRequest();
  }

  override canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  override handleRequest(
    err: unknown,
    user: unknown,
    info: unknown,
    context: ExecutionContext,
    status: unknown,
  ) {
    if (environment.debugGuards && (info || err)) {
      console.log({ err, user, info, context, status });
    }
    return super.handleRequest(err, user, info, context, status);
  }
}

export const JwtAuthenticationGuard = {
  provide: APP_GUARD,
  useClass: JwtAuthenticationGuardClass,
};
