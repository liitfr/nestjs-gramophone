import { Injectable } from '@nestjs/common';

import { AuthorDocument } from '../../entities/author.entity';
import { Repository } from '../../../data/abstracts/repository.abstract';

@Injectable()
export abstract class AuthorsRepository extends Repository<AuthorDocument> {}
