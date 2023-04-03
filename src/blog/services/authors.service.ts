import { SimpleServiceFactory } from '../../utils/services/simple-service.factory';

import { Author } from '../entities/author.entity';
import { AuthorsRepository } from '../repositories/abstract/authors.repository';

export class AuthorsService extends SimpleServiceFactory(
  Author,
  AuthorsRepository,
) {}
