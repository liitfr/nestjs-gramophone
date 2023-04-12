import { DynamicModule, Global, Module } from '@nestjs/common';
import { RequestScopeModule } from 'nj-request-scope';
import { MongooseModule } from '@nestjs/mongoose';

import { DbSession } from './abstracts/db-session.abstract';
import { Repository } from './abstracts/repository.abstract';
import { DbSessionPlugin } from './plugins';
import { MongoDbSession } from './mongo/services/db-session.service';
import { MongoRepositoriesFactory } from './mongo/factories/repositories.factory';
import { MongoRepository } from './mongo/services/repository.service';
import { MongoModelsFactory } from './mongo/factories/models.factory';
import { RepositoryFinder } from './services/repository-finder';
import { CheckRelations } from './pipes/check-relations.pipe';

@Global()
@Module({})
export class DataServicesModule {
  static forRoot(): DynamicModule {
    const MongoModels = MongoModelsFactory();
    const MongoRepositories = MongoRepositoriesFactory();

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
        RepositoryFinder,
        CheckRelations,
      ],
      exports: [
        DbSession,
        Repository,
        ...MongoRepositories,
        RepositoryFinder,
        CheckRelations,
      ],
    };
  }
}
