import { SimpleResolverFactory } from '../../utils/resolvers/simple-resolver.factory';

import { Color } from '../models/color.model';
import { ColorInput } from '../dtos/color.input';
import { ColorsService } from '../services/colors.service';

export const ColorsResolver = SimpleResolverFactory(
  Color,
  ColorInput,
  ColorsService,
  {
    noMutation: true,
  },
);
