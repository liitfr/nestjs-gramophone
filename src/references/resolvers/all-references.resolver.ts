import { Query, ResolveField, Resolver } from '@nestjs/graphql';

import { AllReferences } from '../entities/all-references.entity';
import { ReferencesService } from '../services/references.service';
import { ColorsService } from '../services/colors.service';
import { TypesService } from '../services/types.service';
import { Color } from '../entities/color.entity';
import { Type } from '../entities/type.entity';
import { Reference } from '../entities/reference.entity';

@Resolver(() => AllReferences)
export class AllReferencesResolver {
  constructor(
    private readonly colorsService: ColorsService,
    private readonly typesService: TypesService,
    private readonly referencesService: ReferencesService,
  ) {}

  @Query(() => AllReferences, { name: 'AllReferences' })
  async getAllReferences() {
    return {};
  }

  @ResolveField(() => [Color], {
    name: 'colors',
  })
  async findColors() {
    return this.colorsService.findAll();
  }

  @ResolveField(() => [Color], {
    name: 'activeColors',
  })
  async findActiveColors() {
    return this.colorsService.findAllActive();
  }

  @ResolveField(() => [Type], {
    name: 'types',
  })
  async findTypes() {
    return this.typesService.findAll();
  }

  @ResolveField(() => [Type], {
    name: 'activeTypes',
  })
  async findActiveTypes() {
    return this.typesService.findAllActive();
  }

  @ResolveField(() => [Reference], {
    name: 'references',
  })
  async findReferences() {
    return this.referencesService.findAll();
  }
}
