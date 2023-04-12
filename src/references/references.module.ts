import { Module } from '@nestjs/common';

import { TypesServiceProviders } from './services/types.service';
import { ColorsServiceProviders } from './services/colors.service';
import { ReferencesServiceProviders } from './services/references.service';
import { TypesResolver } from './resolvers/types.resolver';
import { ColorsResolver } from './resolvers/colors.resolver';
import { ReferencesResolver } from './resolvers/references.resolver';
import { AllReferencesResolver } from './resolvers/all-references.resolver';

@Module({
  providers: [
    ...TypesServiceProviders,
    ...ColorsServiceProviders,
    ...ReferencesServiceProviders,
    TypesResolver,
    ColorsResolver,
    ReferencesResolver,
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
