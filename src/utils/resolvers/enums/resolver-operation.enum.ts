import { registerEnumType } from '@nestjs/graphql';

export enum ResolverOperationEnum {
  CountAll = 'CountAll',
  CountSome = 'CountSome',
  Create = 'Create',
  FindAll = 'FindAll',
  FindOneAndUpdate = 'FindOneAndUpdate',
  FindOne = 'FindOne',
  FindSome = 'FindSome',
  RelationPartitionCount = 'RelationPartitionCount',
  RelationPartitionFind = 'RelationPartitionFind',
  RelationResolve = 'RelationResolve',
  Remove = 'Remove',
  ReversedRelationId = 'ReversedRelationId',
  ReversedRelationResolve = 'ReversedRelationResolve',
  UpdateMany = 'UpdateMany',
  UpdateOne = 'UpdateOne',
}

registerEnumType(ResolverOperationEnum, {
  name: 'ResolverOperationEnum',
});
