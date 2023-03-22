import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { join } from 'path';

import { AuthorsService } from './authors.service';
import { AuthorsResolver } from './authors.resolver';
import { PostsService } from './posts.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
    }),
  ],
  providers: [AuthorsService, PostsService, AuthorsResolver],
})
export class AppModule {}
