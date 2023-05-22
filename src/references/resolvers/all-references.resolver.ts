import { Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { SimplePoliciesGuard } from '../../authorization/guards/simple-policies.guard';
import { CheckPolicies } from '../../authorization/decorators/check-policies.decorator';
import { AppAbility } from '../../authorization/factories/casl-ability.factory';

import { AllReferences } from '../entities/all-references.entity';
import { ReferencesService } from '../services/references.service';
import { ColorsService } from '../services/colors.service';
import { TypesService } from '../services/types.service';
import { Color } from '../entities/color.entity';
import { Type } from '../entities/type.entity';
import { Reference } from '../entities/reference.entity';
import { UserActionsService } from '../services/user-actions.service';
import { UserRolesService } from '../services/user-roles.service';
import { UserAction } from '../entities/user-action.entity';
import { UserRole } from '../entities/user-role.entity';
import { UserActionEnum } from '../enums/user-action.enum';

@Resolver(() => AllReferences)
export class AllReferencesResolver {
  constructor(
    private readonly colorsService: ColorsService,
    private readonly typesService: TypesService,
    private readonly referencesService: ReferencesService,
    private readonly userActionsService: UserActionsService,
    private readonly userRolesService: UserRolesService,
  ) {}

  @Query(() => AllReferences, {
    name: 'AllReferences',
    description: 'References : All references query',
  })
  @UseGuards(SimplePoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(UserActionEnum.Read, Reference),
  )
  async getAllReferences() {
    return {};
  }

  @ResolveField(() => [Color], {
    name: 'colors',
    description: "All References's all colors",
  })
  @UseGuards(SimplePoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(UserActionEnum.Read, Color),
  )
  async findColors() {
    return this.colorsService.findAll();
  }

  @ResolveField(() => [Color], {
    name: 'activeColors',
    description: "All References's all active colors",
  })
  @UseGuards(SimplePoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(UserActionEnum.Read, Color),
  )
  async findActiveColors() {
    return this.colorsService.findAllActive();
  }

  @ResolveField(() => [Type], {
    name: 'types',
    description: "All References's all types",
  })
  @UseGuards(SimplePoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(UserActionEnum.Read, Type),
  )
  async findTypes() {
    return this.typesService.findAll();
  }

  @ResolveField(() => [Type], {
    name: 'activeTypes',
    description: "All References's all active generic statuses",
  })
  @UseGuards(SimplePoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(UserActionEnum.Read, Type),
  )
  async findActiveTypes() {
    return this.typesService.findAllActive();
  }

  @ResolveField(() => [Reference], {
    name: 'references',
    description: "All References's all references",
  })
  @UseGuards(SimplePoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(UserActionEnum.Read, Reference),
  )
  async findReferences() {
    return this.referencesService.findAll();
  }

  @ResolveField(() => [UserAction], {
    name: 'userActions',
    description: "All References's all user actions",
  })
  @UseGuards(SimplePoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(UserActionEnum.Read, UserAction),
  )
  async findUserActions() {
    return this.userActionsService.findAll();
  }

  @ResolveField(() => [UserAction], {
    name: 'activeUserActions',
    description: "All References's all active user actions",
  })
  @UseGuards(SimplePoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(UserActionEnum.Read, UserAction),
  )
  async findActiveUserActions() {
    return this.userActionsService.findAllActive();
  }

  @ResolveField(() => [UserRole], {
    name: 'userRoles',
    description: "All References's all user roles",
  })
  @UseGuards(SimplePoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(UserActionEnum.Read, UserRole),
  )
  async findUserRoles() {
    return this.userRolesService.findAll();
  }

  @ResolveField(() => [UserRole], {
    name: 'activeUserRoles',
    description: "All References's all active user roles",
  })
  @UseGuards(SimplePoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(UserActionEnum.Read, UserRole),
  )
  async findActiveUserRoles() {
    return this.userRolesService.findAllActive();
  }
}
