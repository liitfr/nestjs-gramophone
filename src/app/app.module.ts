import { Logger, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { Logger as ApolloLogger } from '@apollo/utils.logger';
import { identity } from 'lodash';
import { join } from 'path';

import { DataServicesModule } from '../data/data-services.module';
import { ReferencesModule } from '../references/references.module';
import { BlogModule } from '../blog/blog.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { AuthenticationModule } from '../authentication/authentication.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      csrfPrevention: true,
      context: identity,
      // resolvers: { Long: LongScalar, Id: IdScalar },
      logger: Logger as unknown as ApolloLogger,
      fieldResolverEnhancers: ['filters', 'guards', 'interceptors'],
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/sngmb', {
      dbName: 'sngmb',
    }),
    DataServicesModule.forRoot(),
    ReferencesModule,
    AuthorizationModule,
    AuthenticationModule,
    BlogModule,
  ],
  providers: [],
})
export class AppModule {}
