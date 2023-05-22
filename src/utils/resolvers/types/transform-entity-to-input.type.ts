import { U, O } from 'ts-toolbelt';

import { Id } from '../../types/id.type';
import { Trackable } from '../../types/trackable.type';
import { Idable } from '../../types/idable.type';

// here we remove trackable properties recursively and we make _id optional

// WARNING :  don't forget to change `deep-entity-partial.type.ts` if you change this file

export type _TransformEntityToInput<
  T,
  R extends PropertyKey = keyof Trackable,
> = O.Omit<
  {
    // TODO : Check if we should add check if extends MongooseSchema.Types.ObjectId
    // WARNING : We don't want to go inside Id even if it actually contains _id field.
    [K in keyof T]: T[K] extends Id | U.Nullable<Id>
      ? T[K]
      : // ----
      T[K] extends Array<infer Item>
      ? Item extends Id
        ? Array<Item>
        : Item extends Idable
        ? Array<_TransformEntityToInput<Item, R>>
        : Array<Item>
      : // ----
      T[K] extends U.Nullable<Array<infer Item>>
      ? Item extends Id
        ? U.Nullable<Array<Item>>
        : Item extends Idable
        ? U.Nullable<Array<_TransformEntityToInput<Item, R>>>
        : U.Nullable<Array<Item>>
      : // ----
      T[K] extends ReadonlyArray<infer Item>
      ? Item extends Id
        ? ReadonlyArray<Item>
        : Item extends Idable
        ? ReadonlyArray<_TransformEntityToInput<Item, R>>
        : ReadonlyArray<Item>
      : // ----
      T[K] extends U.Nullable<ReadonlyArray<infer Item>>
      ? Item extends Id
        ? U.Nullable<ReadonlyArray<Item>>
        : Item extends Idable
        ? U.Nullable<ReadonlyArray<_TransformEntityToInput<Item, R>>>
        : U.Nullable<ReadonlyArray<Item>>
      : // ----
      T[K] extends Set<infer Item>
      ? Item extends Id
        ? Set<Item>
        : Item extends Idable
        ? Set<_TransformEntityToInput<Item, R>>
        : Set<Item>
      : // ----
      T[K] extends U.Nullable<Set<infer Item>>
      ? Item extends Id
        ? U.Nullable<Set<Item>>
        : Item extends Idable
        ? U.Nullable<Set<_TransformEntityToInput<Item, R>>>
        : U.Nullable<Set<Item>>
      : // ----
      T[K] extends ReadonlySet<infer Item>
      ? Item extends Id
        ? ReadonlySet<Item>
        : Item extends Idable
        ? ReadonlySet<_TransformEntityToInput<Item, R>>
        : ReadonlySet<Item>
      : // ----
      T[K] extends U.Nullable<ReadonlySet<infer Item>>
      ? Item extends Id
        ? U.Nullable<ReadonlySet<Item>>
        : Item extends Idable
        ? U.Nullable<ReadonlySet<_TransformEntityToInput<Item, R>>>
        : U.Nullable<ReadonlySet<Item>>
      : // ----
      T[K] extends Map<infer Key, infer Value>
      ? Value extends Id
        ? Map<Key, Value>
        : Value extends Idable
        ? Map<Key, _TransformEntityToInput<Value, R>>
        : Map<Key, Value>
      : // ----
      T[K] extends U.Nullable<Map<infer Key, infer Value>>
      ? Value extends Id
        ? U.Nullable<Map<Key, Value>>
        : Value extends Idable
        ? U.Nullable<Map<Key, _TransformEntityToInput<Value, R>>>
        : U.Nullable<Map<Key, Value>>
      : // ----
      T[K] extends ReadonlyMap<infer Key, infer Value>
      ? Value extends Id
        ? ReadonlyMap<Key, Value>
        : Value extends Idable
        ? ReadonlyMap<Key, _TransformEntityToInput<Value, R>>
        : ReadonlyMap<Key, Value>
      : // ----
      T[K] extends U.Nullable<ReadonlyMap<infer Key, infer Value>>
      ? Value extends Id
        ? U.Nullable<ReadonlyMap<Key, Value>>
        : Value extends Idable
        ? U.Nullable<ReadonlyMap<Key, _TransformEntityToInput<Value, R>>>
        : U.Nullable<ReadonlyMap<Key, Value>>
      : // ----
      T[K] extends object
      ? // We only go inside if it's an object that has _id and is not of Id type
        T[K] extends Idable
        ? _TransformEntityToInput<T[K], R>
        : T[K]
      : // ----
      T[K] extends U.Nullable<infer O>
      ? // We only go inside if it's an object that has _id and is not of Id type
        O extends object
        ? O extends Idable
          ? U.Nullable<_TransformEntityToInput<O, R>>
          : U.Nullable<O>
        : T[K]
      : // ----
        T[K];
  },
  R | '_id'
> & { _id?: Id | undefined };

export type TransformEntityToInput<
  T extends object,
  R extends PropertyKey = keyof Trackable,
> = _TransformEntityToInput<T, R>;
