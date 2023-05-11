import { Field, InputType } from '@nestjs/graphql';

import { SimpleVersionedEntityInputFactory } from '../../versioning/factories/simple-versioned-entity-input.factory';

import { Post } from '../entities/post.entity';
import { ChipInput } from 'src/references/dtos/chip.input';

@InputType({ isAbstract: true })
class FieldsToAddToPostInput {
  @Field(() => ChipInput, {
    nullable: true,
    description: "Post's chip",
  })
  chip?: ChipInput;
}

@InputType({ description: 'Post Input' })
export class PostInput extends SimpleVersionedEntityInputFactory(Post, {
  removeFields: ['chip'],
  AddFields: [FieldsToAddToPostInput],
}) {}
