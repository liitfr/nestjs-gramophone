import { ObjectType, OmitType } from '@nestjs/graphql';

import { User } from './user.entity';

// README : this type is mainly used for login mutation
// Because during mutation, we're not logged in yet,
// so Field Resolvers won't be able to fetch data ...
// We therefore need to omit this resolvers in User type
// This is expected behavior since we set fieldResolverEnhancers: ['filters', 'guards', 'interceptors']

@ObjectType()
export class UserWithNoFieldResolver extends OmitType(User, [] as const) {}
