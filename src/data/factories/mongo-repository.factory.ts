import mongoose, { Document, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Type } from '@nestjs/common';

import { getEntityMetadata } from '../../utils/entities/entity.util';
import { pascalCase, pluralize } from '../../utils/string.util';

import { MongoRepository } from '../mongo/services/repository.service';
import { DbSession } from '../abstracts/db-session.abstract';

export const MongoRepositoryFactory = (Entity: Type<unknown>) => {
  const { entityName } = getEntityMetadata(Entity);

  const result = {
    provide: `${pluralize(pascalCase(entityName))}Repository`,
    useFactory: (
      dbSession: DbSession<mongoose.ClientSession>,
      model: Model<Document>,
    ) => new MongoRepository(dbSession, model),
    inject: [DbSession, { token: getModelToken(Entity.name), optional: false }],
  };
  return result;
};
