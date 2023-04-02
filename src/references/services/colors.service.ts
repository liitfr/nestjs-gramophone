import { Inject, Injectable } from '@nestjs/common';

import { SimpleService } from '../../utils/services/simple.service';

import { ColorsRepository } from '../repositories/abstract/colors.repository';
import { ColorDocument } from '../models/color.model';

@Injectable()
export class ColorsService extends SimpleService<ColorDocument> {
  constructor(
    @Inject(ColorsRepository)
    private readonly colorsRepository: ColorsRepository,
  ) {
    super(colorsRepository);
  }
}
