import { InputType } from '@nestjs/graphql';

import { Post } from '../models/post.model';
import { SimpleInputGenerator } from 'src/utils/simple-input';

@InputType()
export class CreatePostInput extends SimpleInputGenerator(Post) {}
