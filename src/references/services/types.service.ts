import { Injectable } from '@nestjs/common';

import { TypesRepository } from '../repositories/abstract/types.repository';
import { Type } from '../entities/type.entity';
import { SimpleReferenceServiceFactory } from '../factories/simple-reference-service.factory';

@Injectable()
export class TypesService extends SimpleReferenceServiceFactory(
  Type,
  TypesRepository,
  'TypesService',
) {}
