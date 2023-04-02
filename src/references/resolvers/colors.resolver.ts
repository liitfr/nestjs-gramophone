import { Resolver } from '@nestjs/graphql';

import { SimpleResolverFactory } from '../../utils/resolvers/simple-resolver.factory';

import { Color, ColorDocument } from '../models/color.model';
import { ColorsService } from '../services/colors.service';
import { ColorInput } from '../dtos/color.input';

const SimpleColorResolver = SimpleResolverFactory(Color, ColorInput, {
  noMutation: true,
});

@Resolver(() => Color)
export class ColorsResolver extends SimpleColorResolver<ColorDocument> {
  constructor(
    simpleService: ColorsService,
    private typesService: ColorsService,
  ) {
    super(simpleService);
  }
}
