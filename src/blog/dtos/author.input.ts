import { InputType } from '@nestjs/graphql';

import { SimpleEntityInputFactory } from '../../utils/dtos/simple-entity-input.factory';

import { Author } from '../entities/author.entity';

@InputType({ description: 'Author Input' })
export class AuthorInput extends SimpleEntityInputFactory(Author) {}
