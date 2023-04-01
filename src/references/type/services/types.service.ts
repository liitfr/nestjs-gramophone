import { Inject, Injectable } from '@nestjs/common';

import { SimpleService } from '../../../utils/services/simple.service';

import { TypesRepository } from '../repositories/abstract/types.repository';
import { TypeDocument } from '../models/type.model';

@Injectable()
export class TypesService extends SimpleService<TypeDocument> {
  constructor(
    @Inject(TypesRepository)
    private readonly typesRepository: TypesRepository,
  ) {
    super(typesRepository);
  }
}
