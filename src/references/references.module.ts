import { Module } from '@nestjs/common';

// 1. Services
import { TypesServiceProviders } from './services/types.service';
import { ColorsServiceProviders } from './services/colors.service';
import { ReferencesServiceProviders } from './services/references.service';
import { UserActionsServiceProviders } from './services/user-actions.service';
import { UserRolesServiceProviders } from './services/user-roles.service';

// 2. Resolvers
import { TypesResolverProvider } from './resolvers/types.resolver';
import { ColorsResolverProvider } from './resolvers/colors.resolver';
import { ReferencesResolverProvider } from './resolvers/references.resolver';
import { AllReferencesResolver } from './resolvers/all-references.resolver';
import { UserRolesResolver } from './resolvers/user-roles.resolver';
import { UserActionsResolver } from './resolvers/user-actions.resolver';

@Module({
  providers: [
    ...TypesServiceProviders,
    ...ColorsServiceProviders,
    ...ReferencesServiceProviders,
    ...UserActionsServiceProviders,
    ...UserRolesServiceProviders,
    TypesResolverProvider,
    ColorsResolverProvider,
    ReferencesResolverProvider,
    UserActionsResolver,
    UserRolesResolver,
    AllReferencesResolver,
  ],
  exports: [
    ...TypesServiceProviders,
    ...ColorsServiceProviders,
    ...ReferencesServiceProviders,
    ...UserActionsServiceProviders,
    ...UserRolesServiceProviders,
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ReferencesModule {}
