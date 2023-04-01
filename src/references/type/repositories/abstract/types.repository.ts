import { Injectable } from '@nestjs/common';

import { repositoryDescription } from '../../../../utils/repositories/repository.util';
import { Repository } from '../../../../data/abstracts/repository.abstract';

import { TypeDocument } from '../../models/type.model';

@Injectable()
export abstract class TypesRepository extends Repository<TypeDocument> {
  static [repositoryDescription] = 'Types Repository';
}
