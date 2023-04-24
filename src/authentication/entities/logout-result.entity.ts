import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Logout Result' })
export class LogoutResult {
  @Field(() => Boolean, {
    description: "Logout Result's loggued out ?",
  })
  loggedOut: boolean;
}
