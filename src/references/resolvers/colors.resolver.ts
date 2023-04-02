import { Color } from '../models/color.model';
import { ColorInput } from '../dtos/color.input';
import { ColorsService } from '../services/colors.service';

import { SimpleReferenceResolverFactory } from './simple-reference-resolver.factory';

export const ColorsResolver = SimpleReferenceResolverFactory(
  Color,
  ColorInput,
  ColorsService,
);
