import { Injectable } from '@nestjs/common';

import { Repository } from '../../../data/abstracts/repository.abstract';

import { ColorDocument } from '../../models/color.model';

@Injectable()
export abstract class ColorsRepository extends Repository<ColorDocument> {}
