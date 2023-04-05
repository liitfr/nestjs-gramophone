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

  @Query(() => AllReferences, {
    name: 'AllReferences',
    description: 'References : All references query',
  })
  async getAllReferences() {
    return {};
  }

  @ResolveField(() => [Color], {
    name: 'colors',
    description: "All References's all colors",
  })
  async findColors() {
    return this.colorsService.findAll();
  }

  @ResolveField(() => [Color], {
    name: 'activeColors',
    description: "All References's all active colors",
  })
  async findActiveColors() {
    return this.colorsService.findAllActive();
  }

  @ResolveField(() => [Type], {
    name: 'types',
    description: "All References's all types",
  })
  async findTypes() {
    return this.typesService.findAll();
  }

  @ResolveField(() => [Type], {
    name: 'activeTypes',
    description: "All References's all active generic statuses",
  })
  async findActiveTypes() {
    return this.typesService.findAllActive();
  }

  @ResolveField(() => [Reference], {
    name: 'references',
    description: "All References's all references",
  })
  async findReferences() {
    return this.referencesService.findAll();
  }
}
