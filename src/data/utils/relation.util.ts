import { STHandle } from '../../utils/types/handle.type';

export type RelationOptions = {
  nullable?: boolean;
  multiple?: boolean;
  partitionQueries?: boolean;
  resolve?: boolean;
  reversible?: boolean;
  reversedIdName?: string;
  reverseResolve?: boolean;
};

export const defaultRelationOptions = {
  nullable: false,
  multiple: false,
  partitionQueries: false,
  resolve: true,
  reversible: false,
  reverseResolve: true,
};

export type RelationDetails = RelationOptions & {
  idName: string;
  idDescription: string;
  resolvedName: string;
  resolvedDescription: string;
  reversedIdDescription?: string;
  reversedResolvedName?: string;
  reversedResolvedDescription?: string;
};

export interface EntityRelation<E extends object = object> {
  target: STHandle<E>;
  details: RelationDetails;
}
