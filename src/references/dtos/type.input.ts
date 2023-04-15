import { InputType } from '@nestjs/graphql';

import { SimpleEntityInputFactory } from '../../utils/dtos/simple-entity-input.factory';

import { Type } from '../entities/type.entity';

@InputType({ description: 'Type Input' })
export class TypeInput extends SimpleEntityInputFactory(Type) {}
