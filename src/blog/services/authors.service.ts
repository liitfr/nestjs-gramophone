import { Inject, Injectable } from '@nestjs/common';

import { SimpleService } from '../../utils/services/simple.service';

import { AuthorDocument } from '../entities/author.entity';
import { AuthorsRepository } from '../repositories/abstract/authors.repository';

@Injectable()
export class AuthorsService extends SimpleService<AuthorDocument> {
  constructor(
    @Inject(AuthorsRepository)
    private readonly authorsRepository: AuthorsRepository,
  ) {
    super(authorsRepository);
  }
}
