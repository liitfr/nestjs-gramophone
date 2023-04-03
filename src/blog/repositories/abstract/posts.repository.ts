import { PostDocument } from '../../entities/post.entity';
import { Repository } from '../../../data/abstracts/repository.abstract';

export class PostsRepository extends Repository<PostDocument> {}
