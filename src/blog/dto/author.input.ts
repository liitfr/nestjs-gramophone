import { InputType } from '@nestjs/graphql';

import { SimpleVersionedEntityInputFactory } from '../../versioning/dto/simple-versioned-entity-input.factory';

import { Author } from '../models/author.model';

@InputType()
export class AuthorInput extends SimpleVersionedEntityInputFactory(Author) {}
