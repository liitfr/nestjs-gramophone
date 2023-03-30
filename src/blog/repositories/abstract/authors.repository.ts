import { Injectable } from '@nestjs/common';

import { AuthorDocument } from '../../../blog/models/author.model';
import { Repository } from '../../../data/abstracts/repository.abstract';
import { repositoryDescription } from 'src/utils/repository.util';

@Injectable()
export abstract class AuthorsRepository extends Repository<AuthorDocument> {
  static [repositoryDescription] = 'Authors Repository';
}
