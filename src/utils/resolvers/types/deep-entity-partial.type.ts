import { Object } from 'ts-toolbelt';

import { Id } from '../../types/id.type';
import { Idable } from '../../entities/simple-entity.decorator';

// WARNING : We don't want to go inside object as Date or Id for example.
// Only Idable objects.

// WARNING :  don't forget to change `transform-entity-to-input` if you change this file

export type DeepEntityPartial<O extends object> = Object.Partial<{
  [K in keyof O]?: O[K] extends Id
    ? O[K] | undefined
    : // ----
    O[K] extends Array<infer Item>
    ? Item extends Id
      ? Array<Item> | undefined
      : Item extends Idable
      ? Array<DeepEntityPartial<Item>> | undefined
      : Array<Item> | undefined
    : // ----
    O[K] extends ReadonlyArray<infer Item>
    ? Item extends Id
      ? ReadonlyArray<Item> | undefined
      : Item extends Idable
      ? ReadonlyArray<DeepEntityPartial<Item>> | undefined
      : ReadonlyArray<Item> | undefined
    : // ----
    O[K] extends Set<infer Item>
    ? Item extends Id
      ? Set<Item> | undefined
      : Item extends Idable
      ? Set<DeepEntityPartial<Item>> | undefined
      : Set<Item> | undefined
    : // ----
    O[K] extends ReadonlySet<infer Item>
    ? Item extends Id
      ? ReadonlySet<Item> | undefined
      : Item extends Idable
      ? ReadonlySet<DeepEntityPartial<Item>> | undefined
      : ReadonlySet<Item> | undefined
    : // ----
    O[K] extends Map<infer Key, infer Value>
    ? Value extends Id
      ? Map<Key, Value> | undefined
      : Value extends Idable
      ? Map<Key, DeepEntityPartial<Value>> | undefined
      : Map<Key, Value> | undefined
    : // ----
    O[K] extends ReadonlyMap<infer Key, infer Value>
    ? Value extends Id
      ? ReadonlyMap<Key, Value> | undefined
      : Value extends Idable
      ? ReadonlyMap<Key, DeepEntityPartial<Value>> | undefined
      : ReadonlyMap<Key, Value> | undefined
    : // ----
    O[K] extends object
    ? O[K] extends Idable
      ? DeepEntityPartial<O[K]> | undefined
      : O[K] | undefined
    : O[K] | undefined;
}>;
