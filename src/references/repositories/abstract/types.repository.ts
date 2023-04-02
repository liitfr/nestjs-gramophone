import { Injectable } from '@nestjs/common';

import { Repository } from '../../../data/abstracts/repository.abstract';

import { TypeDocument } from '../../entities/type.entity';

@Injectable()
export class TypesRepository extends Repository<TypeDocument> {}
