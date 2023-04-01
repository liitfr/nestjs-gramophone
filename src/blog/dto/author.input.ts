import { InputType } from '@nestjs/graphql';

import { SimpleEntityInputFactory } from '../../utils/dto/simple-entity-input.factory';

import { Author } from '../models/author.model';

@InputType()
export class AuthorInput extends SimpleEntityInputFactory(Author) {}
