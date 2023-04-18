import { Module } from '@nestjs/common';

// 1. Services
import { TypesServiceProviders } from './services/types.service';
import { ColorsServiceProviders } from './services/colors.service';
import { ReferencesServiceProviders } from './services/references.service';

// 2. Resolvers
import { TypesResolverProvider } from './resolvers/types.resolver';
import { ColorsResolverProvider } from './resolvers/colors.resolver';
import { ReferencesResolverProvider } from './resolvers/references.resolver';
import { AllReferencesResolver } from './resolvers/all-references.resolver';

@Module({
  providers: [
    ...TypesServiceProviders,
    ...ColorsServiceProviders,
    ...ReferencesServiceProviders,
    TypesResolverProvider,
    ColorsResolverProvider,
    ReferencesResolverProvider,
    AllReferencesResolver,
  ],
  exports: [
    ...TypesServiceProviders,
    ...ColorsServiceProviders,
    ...ReferencesServiceProviders,
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ReferencesModule {}
