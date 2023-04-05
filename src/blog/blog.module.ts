import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { VersioningModule } from '../versioning/versioning.module';

import { Author, AuthorSchema } from './entities/author.entity';
import { Post, PostSchema } from './entities/post.entity';
import { AuthorsResolver } from './resolvers/authors.resolver';
import { PostsResolver } from './resolvers/posts.resolver';
import { PostsService } from './services/posts.service';
import { AuthorsService } from './services/authors.service';
import { ReferencesModule } from '../references/references.module';
import { MongoRepositoryFactory } from '../data/factories/mongo-repository.factory';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Author.name, schema: AuthorSchema },
      { name: Post.name, schema: PostSchema },
    ]),
    VersioningModule.forRoot(),
    ReferencesModule,
  ],
  providers: [
    MongoRepositoryFactory(Author),
    MongoRepositoryFactory(Post),
    PostsService,
    AuthorsService,
    PostsResolver,
    AuthorsResolver,
  ],
  exports: [],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class BlogModule {}
