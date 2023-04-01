import { InputType } from '@nestjs/graphql';

import { SimpleVersionedEntityInputFactory } from '../../versioning/dto/simple-versioned-entity-input.factory';

import { Post } from '../models/post.model';

@InputType()
export class PostInput extends SimpleVersionedEntityInputFactory(Post) {}
