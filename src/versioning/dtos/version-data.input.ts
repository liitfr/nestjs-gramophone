import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class VersionDataInput {
  @Field(() => String, {
    nullable: true,
    description: "Version Data's memo",
  })
  memo?: string;

  @Field(() => String, {
    nullable: true,
    description: "Version Data's internal memo",
  })
  internalMemo?: string;

  @Field(() => String, {
    nullable: true,
    description: "Version Data's automatic memo",
  })
  automaticMemo?: string;
}
