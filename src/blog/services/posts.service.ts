import { ServiceProvidersFactory } from '../../utils/services/service-providers.factory';
import { SimpleServiceFactory } from '../../utils/services/simple-service.factory';
import { Versioned } from '../../versioning/decorators/versioned.decorator';

import { Post } from '../entities/post.entity';

const { Service, serviceToken } = SimpleServiceFactory(Post);

@Versioned(Post)
export class PostsService extends Service {}

export const PostsServiceProviders = ServiceProvidersFactory(
  PostsService,
  serviceToken,
);
