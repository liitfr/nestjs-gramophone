import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  async findAllPostsForOneAuthor(authorId: number) {
    // wait 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000));

    this.logger.log('findAllPostsForOneAuthor');

    return [
      {
        id: 1,
        title: 'Post 1',
        content: 'Content 1',
        authorId,
      },
      {
        id: 2,
        title: 'Post 2',
        content: 'Content 2',
        authorId,
      },
      {
        id: 3,
        title: 'Post 3',
        content: 'Content 3',
        authorId,
      },
    ];
  }
}
