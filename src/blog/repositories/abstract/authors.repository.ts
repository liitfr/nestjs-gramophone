import { AuthorDocument } from '../../entities/author.entity';
import { Repository } from '../../../data/abstracts/repository.abstract';

export class AuthorsRepository extends Repository<AuthorDocument> {}
