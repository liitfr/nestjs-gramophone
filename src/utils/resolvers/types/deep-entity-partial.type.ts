import { Id } from '../../types/id.type';
import { Idable } from '../../entities/simple-entity.decorator';

// Warning : We don't want to go inside object as Date or Id for example.
// Only Idable objects.

export type DeepEntityPartial<O extends object> = {
  [K in keyof O]: O[K] extends Id
    ? O[K] | undefined
    : O[K] extends Array<infer ArrayType>
    ? ArrayType extends Idable
      ? Array<DeepEntityPartial<ArrayType> | undefined> | undefined
      : Array<ArrayType | undefined> | undefined
    : O[K] extends ReadonlyArray<infer ArrayType>
    ? ArrayType extends Idable
      ? ReadonlyArray<DeepEntityPartial<ArrayType> | undefined> | undefined
      : ReadonlyArray<ArrayType | undefined> | undefined
    : O[K] extends Set<infer SetType>
    ? SetType extends Idable
      ? Set<DeepEntityPartial<SetType> | undefined> | undefined
      : Set<SetType | undefined> | undefined
    : O[K] extends ReadonlySet<infer SetType>
    ? SetType extends Idable
      ? ReadonlySet<DeepEntityPartial<SetType> | undefined> | undefined
      : ReadonlySet<SetType | undefined> | undefined
    : O[K] extends Map<infer KeyType, infer ValueType>
    ? ValueType extends Idable
      ? Map<KeyType, DeepEntityPartial<ValueType> | undefined> | undefined
      : Map<KeyType, ValueType | undefined> | undefined
    : O[K] extends ReadonlyMap<infer KeyType, infer ValueType>
    ? ValueType extends Idable
      ?
          | ReadonlyMap<KeyType, DeepEntityPartial<ValueType> | undefined>
          | undefined
      : ReadonlyMap<KeyType, ValueType | undefined> | undefined
    : O[K] extends object
    ? O[K] extends Idable
      ? DeepEntityPartial<O[K]> | undefined
      : O[K] | undefined
    : O[K] | undefined;
};
