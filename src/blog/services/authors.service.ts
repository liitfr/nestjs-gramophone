import { SimpleServiceFactory } from '../../utils/services/simple-service.factory';

import { Author } from '../entities/author.entity';

export class AuthorsService extends SimpleServiceFactory(Author) {}
