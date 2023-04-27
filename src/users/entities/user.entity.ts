import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

import {
  Idable,
  SimpleEntity,
  Trackable,
} from '../../utils/entities/simple-entity.decorator';
import { Id } from '../../utils/types/id.type';
import { CreateRepository } from '../../data/decorators/create-repository.decorator';
import { UserRole } from '../../references/entities/user-role.entity';
import { Relation } from '../../data/decorators/relation.decorator';

@ObjectType()
@Schema()
@CreateRepository<MongooseSchema>({
  SchemaTransformer: (Schema) => Schema.index({ email: 1 }, { unique: true }),
})
@SimpleEntity({ isIdable: true, isTrackable: true })
export class User {
  @Field(() => String, {
    nullable: false,
    description: "User's email address",
  })
  @Prop({
    required: true,
    match: /^\S+@\S+\.\S+$/,
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false, type: String })
  currentHashedRefreshToken?: string;

  @Relation(UserRole, { partitionQueries: true, multiple: true })
  roleIds: Id[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface User extends Idable, Trackable {}
