import { STHandle } from '../../utils/types/handle.type';

export type NestedOptions = {
  nullable?: boolean;
  multiple?: boolean;
  description?: string;
};

export const defaultNestedOptions = {
  nullable: false,
  multiple: false,
};

export type NestedDetails = NestedOptions & {
  fieldName: string;
};

export interface EntityNested<E extends object = object> {
  target: STHandle<E>;
  details: NestedDetails;
}
