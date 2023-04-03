import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { VersioningModule } from '../versioning/versioning.module';

import { Author, AuthorSchema } from './entities/author.entity';
import { Post, PostSchema } from './entities/post.entity';
import { AuthorsResolver } from './resolvers/authors.resolver';
import { PostsResolver } from './resolvers/posts.resolver';
import { AuthorsRepository } from './repositories/abstract/authors.repository';
import { PostsRepository } from './repositories/abstract/posts.repository';
import { AuthorsMongoRepository } from './repositories/mongo/authors.repository';
import { PostsMongoRepository } from './repositories/mongo/posts.repository';
import { PostsService } from './services/posts.service';
import { AuthorsService } from './services/authors.service';
import { ReferencesModule } from 'src/references/references.module';

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
    { provide: AuthorsRepository, useClass: AuthorsMongoRepository },
    { provide: PostsRepository, useClass: PostsMongoRepository },
    PostsService,
    AuthorsService,
    PostsResolver,
    AuthorsResolver,
  ],
  exports: [],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class BlogModule {}
