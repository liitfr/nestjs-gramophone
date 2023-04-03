import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';

import { join } from 'path';

// <!> ORDER MATTERS <!>
import { DataServicesModule } from '../data/data-services.module';
// Reference Service adds itselft as service in its entity metadata.
// This metadata (ReferenceService) is used by other providers that
// consum references with decorator AddReferences
// So we need to build Reference before any other module
import { ReferencesModule } from '../references/references.module';
import { BlogModule } from '../blog/blog.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      fieldResolverEnhancers: ['interceptors'],
    }),
    MongooseModule.forRoot(
      'mongodb://localhost:27017/eSocnaDb?replicaSet=eSocnaRs',
      { dbName: 'poc' },
    ),
    DataServicesModule,
    ReferencesModule,
    BlogModule,
  ],
  providers: [],
})
export class AppModule {}
