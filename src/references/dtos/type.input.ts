import { InputType } from '@nestjs/graphql';

import { SimpleEntityInputFactory } from '../../utils/dtos/simple-entity-input.factory';

import { Type } from '../entities/type.entity';

@InputType()
export class TypeInput extends SimpleEntityInputFactory(Type) {}
