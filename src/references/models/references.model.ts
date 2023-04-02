import { Field, ObjectType } from '@nestjs/graphql';

import { Color } from './color.model';
import { Type } from './type.model';

@ObjectType()
export class References {
  @Field(() => [Color])
  colors: (typeof Color)[];

  @Field(() => [Type])
  types: (typeof Type)[];
}
