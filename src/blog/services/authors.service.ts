import { ServiceProvidersFactory } from '../../utils/services/service-providers.factory';
import { SimpleServiceFactory } from '../../utils/services/simple-service.factory';

import { Author } from '../entities/author.entity';

const { Service, serviceToken } = SimpleServiceFactory(Author);

export class AuthorsService extends Service {}

export const AuthorsServiceProviders = ServiceProvidersFactory(
  AuthorsService,
  serviceToken,
);
