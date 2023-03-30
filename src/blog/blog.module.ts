import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { VersioningModule } from '../versioning/versioning.module';

import { Author, AuthorSchema } from './models/author.model';
import { Post, PostSchema } from './models/post.model';
import { AuthorsResolver } from './resolvers/authors.resolver';
import { PostsResolver } from './resolvers/posts.resolver';
import { AuthorsRepository } from './repositories/abstract/authors.repository';
import { PostsRepository } from './repositories/abstract/posts.repository';
import { MongoAuthorsRepository } from './repositories/mongo/authors.repository';
import { MongoPostsRepository } from './repositories/mongo/posts.repository';
import { PostsService } from './services/posts.service';
import { AuthorsService } from './services/authors.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Author.name, schema: AuthorSchema },
      { name: Post.name, schema: PostSchema },
    ]),
    VersioningModule.forRoot(),
  ],
  providers: [
    AuthorsResolver,
    { provide: AuthorsRepository, useClass: MongoAuthorsRepository },
    { provide: PostsRepository, useClass: MongoPostsRepository },
    PostsService,
    AuthorsService,
    PostsResolver,
  ],
  exports: [],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class BlogModule {}
