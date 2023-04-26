import {
  ModelDefinition,
  SchemaFactory as MongooseSchemaFactory,
} from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { identity } from 'lodash';
import { Schema as MongooseSchema } from 'mongoose';

import { RepositoryStore } from '../../services/repository-store.service';

export const MongoModelsFactory = () => {
  const result: ModelDefinition[] = [];

  for (const repository of RepositoryStore.getAll()) {
    const {
      entityToken,
      Entity,
      options: { SchemaTransformer, isDiscriminator, discriminators } = {},
    } = repository;

    if (!entityToken.description) {
      throw new Error(
        `Description not found for token ${entityToken.toString()}`,
      );
    }

    Logger.verbose(
      `MongoModel for ${entityToken.description}`,
      'MongoModelsFactory',
    );

    if (!isDiscriminator) {
      const resolvedDiscriminators = discriminators?.() ?? [];

      result.push({
        name: entityToken.description,
        schema: (SchemaTransformer ?? identity)(
          MongooseSchemaFactory.createForClass(Entity),
        ),
        ...(resolvedDiscriminators && resolvedDiscriminators?.length > 0
          ? {
              discriminators: resolvedDiscriminators.map(
                (resolvedDiscriminator) => {
                  const discriminatorRepository = RepositoryStore.getByEntity<
                    object,
                    MongooseSchema
                  >(resolvedDiscriminator);

                  const name = discriminatorRepository.entityToken.description;

                  if (!name) {
                    throw new Error(
                      `Description not found for token ${discriminatorRepository.entityToken.toString()}`,
                    );
                  }

                  const DiscriminatorSchemaTransformer =
                    discriminatorRepository.options?.SchemaTransformer;

                  return {
                    name,
                    schema: DiscriminatorSchemaTransformer
                      ? DiscriminatorSchemaTransformer(
                          MongooseSchemaFactory.createForClass(
                            resolvedDiscriminator,
                          ),
                        )
                      : MongooseSchemaFactory.createForClass(
                          resolvedDiscriminator,
                        ),
                  };
                },
              ),
            }
          : {}),
      });
    }
  }

  return result;
};
