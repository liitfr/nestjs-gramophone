import { Type } from '@nestjs/common';

import { UnionToIntersection } from './union-to-intersection.type';

export type MergeClassesToObject<T extends Type<unknown>[]> = {
  [K in keyof UnionToIntersection<InstanceType<T[number]>> as Exclude<
    K,
    'constructor'
  >]: UnionToIntersection<InstanceType<T[number]>>[K];
};
