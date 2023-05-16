import { Field, InputType } from '@nestjs/graphql';

import { Post } from '../entities/post.entity';
import { ChipInput } from '../../references/dtos/chip.input';
import { SimpleEntityInputFactory } from '../../utils/dtos/simple-entity-input.factory';

@InputType({ isAbstract: true })
class FieldsToAddToPostInput {
  @Field(() => ChipInput, {
    nullable: true,
    description: "Post's chip",
  })
  chip?: ChipInput;
}

@InputType({ description: 'Post Input' })
export class PostInput extends SimpleEntityInputFactory(Post, {
  removeFields: ['chip'],
  AddFields: [FieldsToAddToPostInput],
}) {}
