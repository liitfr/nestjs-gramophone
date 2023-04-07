import mongoose, { Document, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Type } from '@nestjs/common';

import { getEntityMetadata } from '../../utils/entities/entity.util';

import { MongoRepository } from '../mongo/services/repository.service';
import { DbSession } from '../abstracts/db-session.abstract';

export const MongoRepositoryFactory = (Entity: Type<unknown>) => {
  const entityMetadata = getEntityMetadata(Entity);
  const { entityRepositoryToken } = entityMetadata;

  const result = {
    provide: entityRepositoryToken,
    useFactory: (
      dbSession: DbSession<mongoose.ClientSession>,
      model: Model<Document>,
    ) => new MongoRepository(dbSession, model),
    inject: [DbSession, { token: getModelToken(Entity.name), optional: false }],
  };

  return result;
};
