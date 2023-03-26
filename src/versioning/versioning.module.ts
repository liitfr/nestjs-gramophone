import { DynamicModule, Module } from '@nestjs/common';

import { createVersioners } from './factories/versioners.factory';

@Module({})
export class VersioningModule {
  static forRoot(): DynamicModule {
    const { imports, providers } = createVersioners();
    return {
      module: VersioningModule,
      imports: imports,
      providers,
      exports: providers,
    };
  }
}
