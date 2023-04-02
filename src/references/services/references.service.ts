import { Inject, Injectable } from '@nestjs/common';

import { SimpleService } from '../../utils/services/simple.service';

import { ReferenceDocument } from '../entities/reference.entity';
import { ReferencesRepository } from '../repositories/abstract/references.repository';

@Injectable()
export class ReferencesService extends SimpleService<ReferenceDocument> {
  constructor(
    @Inject(ReferencesRepository)
    private readonly referencesRepository: ReferencesRepository,
  ) {
    super(referencesRepository);
  }
}
