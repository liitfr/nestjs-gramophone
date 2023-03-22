import { Injectable } from '@nestjs/common';

import { Author } from './author.model';

@Injectable()
export class AuthorsService {
  findOneById(id: number): Author {
    return { id, firstName: 'John', lastName: 'Doe' };
  }
}
