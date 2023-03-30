import { Inject, Injectable } from '@nestjs/common';

import { RepositoryService } from '../../utils/services/repository-service.service';
import { AuthorDocument } from '../../blog/models/author.model';
import { serviceDescription } from '../../utils/services/service.util';

import { AuthorsRepository } from '../repositories/abstract/authors.repository';

@Injectable()
export class AuthorsService extends RepositoryService<AuthorDocument> {
  constructor(
    @Inject(AuthorsRepository)
    private readonly authorsRepository: AuthorsRepository,
  ) {
    super(authorsRepository);
  }

  static [serviceDescription] = 'Authors Service';
}
