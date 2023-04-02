import { InputType } from '@nestjs/graphql';

import { SimpleEntityInputFactory } from '../../utils/dtos/simple-entity-input.factory';

import { Color } from '../models/color.model';

@InputType()
export class ColorInput extends SimpleEntityInputFactory(Color) {}
