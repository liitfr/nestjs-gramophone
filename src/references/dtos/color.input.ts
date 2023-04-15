import { InputType } from '@nestjs/graphql';

import { SimpleEntityInputFactory } from '../../utils/dtos/simple-entity-input.factory';

import { Color } from '../entities/color.entity';

@InputType({ description: 'Color Input' })
export class ColorInput extends SimpleEntityInputFactory(Color) {}
