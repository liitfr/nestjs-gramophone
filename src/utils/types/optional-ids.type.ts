import { TransformEntityToInput } from '../resolvers/types/transform-entity-to-input.type';

export type OptionalIds<T extends object> = TransformEntityToInput<T, never>;
