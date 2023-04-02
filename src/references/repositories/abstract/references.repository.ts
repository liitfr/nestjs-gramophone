import { Injectable } from '@nestjs/common';

import { Repository } from '../../../data/abstracts/repository.abstract';

import { ReferenceDocument } from '../../entities/reference.entity';

@Injectable()
export class ReferencesRepository extends Repository<ReferenceDocument> {}
