import mongoose, { Document, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Logger, Provider } from '@nestjs/common';

import { DbSession } from '../../abstracts/db-session.abstract';
import { RepositoryStore } from '../../services/repository-store.service';

import { MongoRepository } from '../services/repository.service';

export const MongoRepositoriesFactory = () => {
  const result: Provider[] = [];

  for (const repository of RepositoryStore.getAll()) {
    const { entityToken, entityRepositoryToken } = repository;

    if (!entityToken) {
      throw new Error('Entity token not found');
    }

    if (!entityToken.description) {
      throw new Error(
        `Description not found for token ${entityToken.toString()}`,
      );
    }

    if (!entityRepositoryToken) {
      throw new Error(
        `Entity repository token not found for entity ${entityToken.description}`,
      );
    }

    Logger.verbose(
      `MongoRepository for ${entityToken.description}`,
      'MongoRepositoriesFactory',
    );

    result.push({
      provide: entityRepositoryToken,
      useFactory: (
        dbSession: DbSession<mongoose.ClientSession>,
        model: Model<Document>,
      ) => {
        const newRepo = new MongoRepository(dbSession, model);
        repository.instance = newRepo;
        return newRepo;
      },
      inject: [
        DbSession,
        { token: getModelToken(entityToken.description), optional: false },
      ],
    });
  }

  return result;
};
