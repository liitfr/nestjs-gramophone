import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { VersioningModule } from '../versioning/versioning.module';

import { Author, AuthorSchema } from './models/author.model';
import { Post, PostSchema } from './models/post.model';
import { AuthorsResolver } from './resolvers/authors.resolver';
import { AuthorsService } from './services/authors.service';
import { PostsService } from './services/posts.service';
import { PostsResolver } from './resolvers/posts.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Author.name, schema: AuthorSchema },
      { name: Post.name, schema: PostSchema },
    ]),
    VersioningModule.forRoot(),
  ],
  providers: [AuthorsResolver, AuthorsService, PostsService, PostsResolver],
  exports: [],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class BlogModule {}
