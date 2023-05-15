import {
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
  PureAbility,
} from '@casl/ability';
import { Injectable, Type } from '@nestjs/common';

import { User } from '../../users/entities/user.entity';
import { UserActionEnum } from '../../references/enums/user-action.enum';
import { UserRolesService } from '../../references/services/user-roles.service';
import { UserRoleEnum } from '../../references/enums/user-role.enum';
import { CustomError, ErrorCode } from '../../utils/errors/custom.error';

type Subjects = InferSubjects<Type<object>> | 'all';

export type AppAbility = PureAbility<[UserActionEnum, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  constructor(private readonly userRolesService: UserRolesService) {}

  async createForUser(user: User) {
    const {
      can,
      cannot: _cannot,
      build,
    } = new AbilityBuilder<PureAbility<[UserActionEnum, Subjects]>>(
      PureAbility as AbilityClass<AppAbility>,
    );

    const roles = await this.userRolesService.findAll();
    const adminRole = roles.find((role) => role.code === UserRoleEnum.Admin);
    const userRole = roles.find((role) => role.code === UserRoleEnum.User);

    if (!adminRole || !userRole) {
      throw new CustomError(
        'Roles not found.',
        ErrorCode.INTERNAL_SERVER_ERROR,
        {
          fr: "Les rôles n'ont pas été trouvés.",
        },
        {
          service: 'CaslAbilityFactory',
          method: 'createForUser',
        },
      );
    }

    if (
      user.roleIds
        .map((roleId) => roleId.toHexString())
        .includes(adminRole._id.toHexString())
    ) {
      can(UserActionEnum.Manage, 'all');
    }

    // can(UserActionEnum.Update, Article, { authorId: user.id });
    // cannot(UserActionEnum.Remove, Article, { isPublished: true });

    return build({
      // Read https://casl.js.org/v5/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
