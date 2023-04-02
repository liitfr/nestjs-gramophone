import { Injectable } from '@nestjs/common';

import { Repository } from '../../../data/abstracts/repository.abstract';

import { ColorDocument } from '../../entities/color.entity';

@Injectable()
export abstract class ColorsRepository extends Repository<ColorDocument> {}
