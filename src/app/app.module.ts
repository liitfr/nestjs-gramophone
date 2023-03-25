import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';

import { join } from 'path';

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
    BlogModule,
  ],
  providers: [],
})
export class AppModule {}
