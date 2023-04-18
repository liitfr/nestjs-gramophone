import { Color } from '../entities/color.entity';
import { ColorInput } from '../dtos/color.input';
import { ColorsService } from '../services/colors.service';
import { SimpleReferenceResolverFactory } from '../factories/simple-reference-resolver.factory';

export const ColorsResolverProvider = {
  provide: 'ColorsResolver',
  useClass: SimpleReferenceResolverFactory(Color, ColorInput, ColorsService),
};
