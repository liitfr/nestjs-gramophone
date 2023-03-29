import { InjectConnection } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { RequestScope } from 'nj-request-scope';

import { DbSession } from '../../abstracts/db-session.abstract';

@Injectable()
@RequestScope()
export class MongoDbSession implements DbSession<mongoose.ClientSession> {
  constructor(
    @InjectConnection()
    private readonly connection: mongoose.Connection,
  ) {
    this.session = null;
  }

  private session: mongoose.ClientSession | null = null;

  public async start() {
    if (!this.session || this.session.hasEnded) {
      this.session = await this.connection.startSession();
    }
    if (!this.session.inTransaction()) {
      this.session.startTransaction({
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority' },
        readPreference: 'primary',
        retryWrites: true,
      });
    }
  }

  public async commit() {
    if (!this.session) {
      throw new Error('Session not started');
    }
    await this.session.commitTransaction();
  }

  public async end() {
    if (!this.session) {
      throw new Error('Session not started');
    }
    await this.session.endSession();
  }

  public async abort() {
    if (!this.session) {
      throw new Error('Session not started');
    }
    await this.session.abortTransaction();
  }

  public get() {
    return this.session;
  }
}
