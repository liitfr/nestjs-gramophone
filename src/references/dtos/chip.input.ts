import { InputType } from '@nestjs/graphql';

import { SimpleEntityInputFactory } from '../../utils/dtos/simple-entity-input.factory';

import { Chip } from '../entities/chip.entity';

@InputType({ description: 'Chip Input' })
export class ChipInput extends SimpleEntityInputFactory(Chip) {}
