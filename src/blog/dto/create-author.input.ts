import { InputType } from '@nestjs/graphql';

import { Author } from '../models/author.model';
import { SimpleInputGenerator } from 'src/utils/simple-input';

@InputType()
export class CreateAuthorInput extends SimpleInputGenerator(Author) {}
