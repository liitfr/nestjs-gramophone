import { Injectable } from '@nestjs/common';

import { AuthorDocument } from '../../../blog/models/author.model';
import { Repository } from '../../../data/abstracts/repository.abstract';

@Injectable()
export abstract class AuthorsRepository extends Repository<AuthorDocument> {}
