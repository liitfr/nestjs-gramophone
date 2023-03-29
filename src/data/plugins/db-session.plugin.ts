import { Logger } from '@nestjs/common';
import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { Plugin } from '@nestjs/apollo';

import { DbSession } from '../abstracts/db-session.abstract';

@Plugin()
export class DbSessionPlugin implements ApolloServerPlugin {
  constructor(private readonly dbSession: DbSession<unknown>) {}

  private readonly logger = new Logger(DbSessionPlugin.name);

  public async requestDidStart() {
    return {
      didResolveOperation: async () => {
        await this.dbSession.start();
      },
      // README: https://github.com/apollographql/apollo-server/issues/4010#issuecomment-637863328
      didEncounterErrors: async (requestContext: any) => {
        await this.dbSession.abort();
        await this.dbSession.end();

        for (const error of requestContext.errors) {
          const err = error.originalError || error;
          this.logger.error(err);
        }
      },
      willSendResponse: async () => {
        await this.dbSession.commit();
        await this.dbSession.end();
      },
    };
  }
}
