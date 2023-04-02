import { Injectable } from '@nestjs/common';

import { PostDocument } from '../../entities/post.entity';
import { Repository } from '../../../data/abstracts/repository.abstract';

@Injectable()
export abstract class PostsRepository extends Repository<PostDocument> {}
