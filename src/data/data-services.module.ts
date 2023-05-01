import { DynamicModule, Global, Module } from '@nestjs/common';
import { RequestScopeModule } from 'nj-request-scope';
import { MongooseModule } from '@nestjs/mongoose';

import { DbSession } from './abstracts/db-session.abstract';
import { Repository } from './abstracts/repository.abstract';
import { DbSessionPlugin } from './plugins/db-session.plugin';
import { MongoDbSession } from './mongo/services/db-session.service';
import { MongoRepositoriesFactory } from './mongo/factories/repositories.factory';
import { MongoRepository } from './mongo/services/repository.service';
import { MongoModelsFactory } from './mongo/factories/models.factory';
import { RepositoryStore } from './services/repository-store.service';
import { CheckRelations } from './pipes/check-relations.pipe';
import { RelationResolversFactory } from './factories/relation-resolvers.factory';

@Global()
@Module({})
export class DataServicesModule {
  static forRoot(): DynamicModule {
    const MongoModels = MongoModelsFactory();
    const MongoRepositories = MongoRepositoriesFactory();
    const RelationResolvers = RelationResolversFactory();

    return {
      module: DataServicesModule,
      imports: [RequestScopeModule, MongooseModule.forFeature(MongoModels)],
      providers: [
        {
          provide: DbSession,
          useClass: MongoDbSession,
        },
        DbSessionPlugin,
        {
          provide: Repository,
          useClass: MongoRepository,
        },
        ...MongoRepositories,
        RepositoryStore,
        ...RelationResolvers,
        CheckRelations,
      ],
      exports: [
        DbSession,
        Repository,
        ...MongoRepositories,
        RepositoryStore,
        CheckRelations,
      ],
    };
  }
}
