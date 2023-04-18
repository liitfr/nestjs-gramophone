import { Module } from '@nestjs/common';

import { VersioningModule } from '../versioning/versioning.module';
import { ReferencesModule } from '../references/references.module';

// 1. Services
import { PostsServiceProviders } from './services/posts.service';
import { AuthorsServiceProviders } from './services/authors.service';

// 2. Resolvers
import { AuthorsResolver } from './resolvers/authors.resolver';
import { PostsResolver } from './resolvers/posts.resolver';

@Module({
  imports: [VersioningModule.forRoot(), ReferencesModule],
  providers: [
    ...PostsServiceProviders,
    ...AuthorsServiceProviders,
    AuthorsResolver,
    PostsResolver,
  ],
  exports: [],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class BlogModule {}
