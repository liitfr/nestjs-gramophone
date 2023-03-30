import { Global, Module } from '@nestjs/common';
import { RequestScopeModule } from 'nj-request-scope';

import { DbSession } from './abstracts/db-session.abstract';
import { Repository } from './abstracts/repository.abstract';
import { DbSessionPlugin } from './plugins';
import { MongoDbSession } from './mongo/services/db-session.service';
import { MongoRepository } from './mongo/services/repository.service';

@Global()
@Module({
  imports: [RequestScopeModule],
  providers: [
    {
      provide: DbSession,
      useClass: MongoDbSession,
    },
    {
      provide: Repository,
      useClass: MongoRepository,
    },
    DbSessionPlugin,
  ],
  exports: [DbSession, Repository],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class DataServicesModule {}
