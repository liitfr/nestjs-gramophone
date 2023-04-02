import { Field, ObjectType } from '@nestjs/graphql';

import { Color } from './color.entity';
import { Type } from './type.entity';

@ObjectType()
export class References {
  @Field(() => [Color])
  colors: (typeof Color)[];

  @Field(() => [Type])
  types: (typeof Type)[];
}
