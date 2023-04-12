import { Module } from '@nestjs/common';

import { VersioningModule } from '../versioning/versioning.module';
import { ReferencesModule } from '../references/references.module';

import { AuthorsResolver } from './resolvers/authors.resolver';
import { PostsResolver } from './resolvers/posts.resolver';
import { PostsServiceProviders } from './services/posts.service';
import { AuthorsServiceProviders } from './services/authors.service';

@Module({
  imports: [VersioningModule.forRoot(), ReferencesModule],
  providers: [
    ...PostsServiceProviders,
    ...AuthorsServiceProviders,
    PostsResolver,
    AuthorsResolver,
  ],
  exports: [],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class BlogModule {}
