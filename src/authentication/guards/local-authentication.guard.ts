import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard as AuthenticationGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

import { environment } from '../../environments/environment';

@Injectable()
export class LocalAuthenticationGuard extends AuthenticationGuard('local') {
  constructor() {
    super({
      usernameField: 'email',
    });
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const gqlReq = ctx.getContext().req;
    if (gqlReq) {
      const { credentials } = ctx.getArgs();
      gqlReq.body = credentials;
      return gqlReq;
    }
    return context.switchToHttp().getRequest();
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
