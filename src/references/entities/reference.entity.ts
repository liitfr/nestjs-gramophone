import { Field, Int } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';

import { ReferenceEnum } from '../enums/reference.enum';
import {
  ISimpleReference,
  SimpleReference,
} from '../decorators/simple-reference.decorator';
import { CreateReferenceRepository } from '../decorators/create-reference-repository.decorator';

@CreateReferenceRepository()
@SimpleReference(ReferenceEnum)
export class Reference {
  @Field(() => Int, {
    nullable: false,
    description: "Reference's active version",
  })
  @Prop({ required: true })
  activeVersion: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Reference extends ISimpleReference<false> {}
