import { ApolloServerPlugin } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';

import { DbSession } from '../abstracts/db-session.abstract';

@Plugin()
export class DbSessionPlugin implements ApolloServerPlugin {
  constructor(private readonly dbSession: DbSession<unknown>) {}

  public async requestDidStart() {
    return {
      didResolveOperation: async () => {
        await this.dbSession.start();
      },
      // README: https://github.com/apollographql/apollo-server/issues/4010#issuecomment-637863328
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      didEncounterErrors: async (_requestContext: any) => {
        await this.dbSession.abort();
        await this.dbSession.end();
      },
      willSendResponse: async (requestContext: any) => {
        if (!requestContext.errors) {
          await this.dbSession.commit();
          await this.dbSession.end();
        }
      },
    };
  }
}
