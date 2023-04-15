import {
  ModelDefinition,
  SchemaFactory as MongooseSchemaFactory,
} from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { identity } from 'lodash';

import { RepositoryStore } from '../../services/repository-store.service';

export const MongoModelsFactory = () => {
  const result: ModelDefinition[] = [];

  for (const repository of RepositoryStore.getAll()) {
    const { entityToken, Entity, options: { SchemaFactory } = {} } = repository;

    Logger.verbose(
      `MongoModel for ${entityToken.description}`,
      'MongoModelsFactory',
    );

    result.push({
      name: entityToken.description,
      schema: (SchemaFactory ?? identity)(
        MongooseSchemaFactory.createForClass(Entity),
      ),
    });
  }

  return result;
};
