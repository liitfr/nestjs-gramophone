import { Inject, Logger } from '@nestjs/common';

import { DbSession } from '../abstracts/db-session.abstract';

export function WithSessionDb() {
  const dbSessionInjector = Inject(DbSession);

  return function decorator(
    target: any,
    _propertyKey: string,
    descriptor: any, // PropertyDescriptor
  ): void {
    dbSessionInjector(target, 'dbSession');
    const originalMethod = descriptor.value;
    const logger = new Logger(`${WithSessionDb.name}#${originalMethod.name}`);

    descriptor.value = async function wrapper(...args: any[]) {
      try {
        await this.dbSession.start();
        const result = await originalMethod.apply(this, args);
        await this.dbSession.commit();
        return result;
      } catch (error) {
        await this.dbSession.abort();
        logger.error(error);
        throw error;
      } finally {
        await this.dbSession.end();
      }
    };
  };
}
