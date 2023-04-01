import { Injectable } from '@nestjs/common';

import { PostDocument } from '../../../blog/models/post.model';
import { Repository } from '../../../data/abstracts/repository.abstract';

@Injectable()
export abstract class PostsRepository extends Repository<PostDocument> {}
