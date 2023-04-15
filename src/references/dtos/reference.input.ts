import { InputType } from '@nestjs/graphql';

import { SimpleEntityInputFactory } from '../../utils/dtos/simple-entity-input.factory';

import { Reference } from '../entities/reference.entity';

@InputType({ description: 'Reference Input' })
export class ReferenceInput extends SimpleEntityInputFactory(Reference) {}
