import { DynamicModule, Module } from '@nestjs/common';

import { VersioningProvidersFactory } from './factories/versioning-providers.factory';

@Module({})
export class VersioningModule {
  static forRoot(): DynamicModule {
    const { serviceProviders, resolverProviders } =
      VersioningProvidersFactory();

    return {
      module: VersioningModule,
      providers: [...serviceProviders, ...resolverProviders],
      exports: serviceProviders,
    };
  }
}
