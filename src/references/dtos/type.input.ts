import { InputType } from '@nestjs/graphql';

import { SimpleEntityInputFactory } from '../../utils/dtos/simple-entity-input.factory';

import { Type } from '../models/type.model';

@InputType()
export class TypeInput extends SimpleEntityInputFactory(Type) {}
