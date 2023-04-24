import { Global, Module } from '@nestjs/common';

import { ReferencesModule } from '../references/references.module';

// 1. Factories
import { CaslAbilityFactory } from './factories/casl-ability.factory';

// 2. Guards
import { SimplePoliciesGuard } from './guards/simple-policies.guard';

@Global()
@Module({
  imports: [ReferencesModule],
  providers: [CaslAbilityFactory, SimplePoliciesGuard],
  exports: [CaslAbilityFactory, SimplePoliciesGuard],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthorizationModule {}
