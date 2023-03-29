import { Controller, UseInterceptors, applyDecorators } from '@nestjs/common';

import { DbSessionInterceptor } from '../interceptors/db-session.interceptor';

export function ControllerWithDbSession(controllerParams?: any) {
  return applyDecorators(
    Controller(controllerParams),
    UseInterceptors(DbSessionInterceptor),
  );
}
