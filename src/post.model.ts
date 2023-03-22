import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Author } from './author.model';

@ObjectType()
export class Post {
  @Field(() => Int)
  id: number;

  @Field({ nullable: false })
  title: string;

  @Field({ nullable: false })
  content: string;

  @Field(() => Author)
  authorId: Author;
}
