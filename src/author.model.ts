import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Author {
  @Field(() => Int)
  id: number;

  @Field({ nullable: false })
  firstName: string;

  @Field({ nullable: false })
  lastName: string;
}
