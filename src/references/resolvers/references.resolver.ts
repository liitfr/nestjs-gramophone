import { Query, Resolver } from '@nestjs/graphql';

import { ReferencesService } from '../services/references.service';
import { References } from '../entities/references.entity';

@Resolver(() => References)
export class ReferencesResolver {
  constructor(private readonly referencesService: ReferencesService) {}

  @Query(() => References)
  async getAllReferences() {
    return this.referencesService.getAllReferences();
  }

  @Query(() => References)
  async getAllEnabledReferences() {
    return this.referencesService.getAllEnabledReferences();
  }
}
