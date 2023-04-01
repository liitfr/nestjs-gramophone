import { InputType } from '@nestjs/graphql';

import { SimpleEntityInputFactory } from '../../../utils/dto/simple-entity-input.factory';

import { Type } from '../models/type.model';

@InputType()
export class TypeInput extends SimpleEntityInputFactory(Type) {}
