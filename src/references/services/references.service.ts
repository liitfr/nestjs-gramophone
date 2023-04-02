import { Injectable } from '@nestjs/common';
import { ColorsService } from './colors.service';
import { TypesService } from './types.service';

@Injectable()
export class ReferencesService {
  constructor(
    private readonly colorsService: ColorsService,
    private readonly typesService: TypesService,
  ) {}

  getAllReferences() {
    return {
      colors: this.colorsService.findAll(),
      types: this.typesService.findAll(),
    };
  }

  getAllEnabledReferences() {
    return {
      colors: this.colorsService.findAllEnabled(),
      types: this.typesService.findAllEnabled(),
    };
  }
}
