import { Color } from '../entities/color.entity';
import { SimpleReferenceServiceFactory } from '../factories/simple-reference-service.factory';

export class ColorsService extends SimpleReferenceServiceFactory(
  Color,
  'ColorsService',
) {}
