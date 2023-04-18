import { Resolver } from '@nestjs/graphql';

import { SimpleResolverFactory } from '../../utils/resolvers/simple-resolver.factory';

import { Post } from '../entities/post.entity';
import { PostsService } from '../services/posts.service';
import { PostInput } from '../dtos/post.input';

const SimplePostResolver = SimpleResolverFactory(Post, PostInput, PostsService);

@Resolver(() => Post)
export class PostsResolver extends SimplePostResolver {}
