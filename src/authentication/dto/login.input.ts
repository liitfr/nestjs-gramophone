import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Login Input' })
export class LoginInput {
  @Field(() => String, {
    nullable: false,
    description: "Login's email",
  })
  readonly email: string;

  @Field(() => String, {
    nullable: false,
    description: "Login's password",
  })
  readonly password: string;
}
