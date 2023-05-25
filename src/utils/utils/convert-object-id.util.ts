import { L, A, Object } from 'ts-toolbelt';
import { update, cloneDeep, get } from 'lodash';

import { Id } from '../types/id.type';

import { resolveWildcardPathsInObject } from './resolve-wildcard-paths-in-object.util';
import { IdFactory } from './id-factory.util';

type RecurseUpdate<
  O extends object,
  P extends ReadonlyArray<ReadonlyArray<A.Key>>,
> = L.Length<P> extends 0
  ? O
  : RecurseUpdate<Object.P.Update<O, L.Head<P>, Id>, L.Tail<P>>;

export const convertObjectIds = <
  T extends object,
  P extends ReadonlyArray<ReadonlyArray<A.Key>> = [['_id']],
>(
  obj: T,
  wildcardPaths: string[] = ['_id'],
  { noError = false }: { noError: boolean } = { noError: false },
): RecurseUpdate<T, P> => {
  const newObj = cloneDeep(obj);
  const convertedPaths = resolveWildcardPathsInObject(newObj, wildcardPaths);

  for (const convertedPath of convertedPaths) {
    const value = get(newObj, convertedPath);

    if (
      value &&
      typeof value === 'string' &&
      value.length === 24 &&
      value.match(/^[0-9a-fA-F]{24}$/)
    ) {
      update(newObj, convertedPath, IdFactory);
    }

    if (!noError) {
      throw new Error(
        `Invalid ObjectId. Object : ${JSON.stringify(
          obj,
        )}, path: ${convertedPath}`,
      );
    }
  }

  return newObj as RecurseUpdate<T, P>;
};

export const convertObjectId = <T extends object>(
  obj: T,
): RecurseUpdate<T, [['_id']]> => convertObjectIds(obj);
