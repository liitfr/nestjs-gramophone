import { Injectable } from '@nestjs/common';

import { SimpleServiceFactory } from '../../utils/services/simple-service.factory';

import { Reference } from '../entities/reference.entity';
import { ReferencesRepository } from '../repositories/abstract/references.repository';

@Injectable()
export class ReferencesService extends SimpleServiceFactory(
  Reference,
  ReferencesRepository,
) {}
