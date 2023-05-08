import { Trackable } from '../../entities/simple-entity.decorator';

type _TransformEntityToInput<
  T,
  R extends PropertyKey = keyof Trackable,
> = T extends Array<infer ArrayType>
  ? Array<_TransformEntityToInput<Omit<ArrayType, R>, R>>
  : T extends ReadonlyArray<infer ArrayType>
  ? ReadonlyArray<_TransformEntityToInput<Omit<ArrayType, R>, R>>
  : T extends Set<infer SetType>
  ? Set<_TransformEntityToInput<Omit<SetType, R>, R>>
  : T extends ReadonlySet<infer SetType>
  ? ReadonlySet<_TransformEntityToInput<Omit<SetType, R>, R>>
  : T extends Map<infer KeyType, infer ValueType>
  ? Map<
      _TransformEntityToInput<KeyType, R>,
      _TransformEntityToInput<Omit<ValueType, R>, R>
    >
  : T extends ReadonlyMap<infer KeyType, infer ValueType>
  ? ReadonlyMap<
      _TransformEntityToInput<KeyType, R>,
      _TransformEntityToInput<Omit<ValueType, R>, R>
    >
  : T extends object
  ? {
      [K in keyof T]: K extends '_id'
        ? T[K] | undefined
        : _TransformEntityToInput<Omit<T[K], R>, R>;
    }
  : T;

export type TransformEntityToInput<
  T extends object,
  R extends PropertyKey = keyof Trackable,
> = _TransformEntityToInput<Omit<T, R>, R>;
