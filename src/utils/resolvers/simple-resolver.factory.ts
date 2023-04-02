import {
  Args,
  Resolver,
  Query,
  Mutation,
  InputType,
  PartialType,
  Int,
} from '@nestjs/graphql';
import { Inject, Type } from '@nestjs/common';

import { IdScalar } from '../scalars/id.scalar';

import { getEntityMetadata } from '../entities/entity.util';
import { SimpleService } from '../services/simple.service';
import { camelCase, pascalCase, pluralize } from '../string.util';
import { Id } from '../id.type';
import { AddTrackableCreationFields } from '../pipes/add-trackable-creation-fields.pipe';
import { AddTrackableUpdateFields } from '../pipes/add-trackable-update-fields.pipe';

interface Options {
  noMutation?: boolean;
}

export function SimpleResolverFactory<D>(
  Entity: Type<unknown>,
  Input: Type<unknown>,
  Service: Type<SimpleService<D>>,
  options: Options = {
    noMutation: false,
  },
) {
  const { entityName, entityDescription } = getEntityMetadata(Entity);

  const setClassName = (classRef: Type<unknown>) =>
    Object.defineProperty(classRef, 'name', {
      value: `${pascalCase(pluralize(entityName))}Resolver`,
    });

  @InputType(`${entityName}PartialInput`)
  class PartialInput extends PartialType(Input) {}

  @Resolver(() => Entity)
  class ResolverWithAutoGetters {
    @Inject(Service)
    readonly simpleService: SimpleService<D>;

    @Query(() => Entity, {
      nullable: false,
      description: `${entityDescription} : Get one query`,
      name: `getOne${pascalCase(entityName)}`,
    })
    async getOne(@Args('id', { type: () => IdScalar }) id: Id): Promise<D> {
      return this.simpleService.findById(id);
    }

    @Query(() => [Entity], {
      nullable: false,
      description: `${entityDescription} : Get all query`,
      name: `getAll${pluralize(pascalCase(entityName))}`,
    })
    async getAll(): Promise<D[]> {
      return this.simpleService.findAll();
    }

    @Query(() => [Entity], {
      nullable: false,
      description: `${entityDescription} : Get some query`,
      name: `getSome${pluralize(pascalCase(entityName))}`,
    })
    async getSome(
      @Args('filter', { type: () => PartialInput }) filter: PartialInput,
    ): Promise<D[]> {
      return this.simpleService.find(filter);
    }

    @Query(() => Int, {
      nullable: false,
      description: `${entityDescription} : Count all query`,
      name: `countAll${pluralize(pascalCase(entityName))}`,
    })
    async countAll(): Promise<number> {
      return this.simpleService.countAll();
    }

    @Query(() => Int, {
      nullable: false,
      description: `${entityDescription} : Count some query`,
      name: `countSome${pluralize(pascalCase(entityName))}`,
    })
    async countSome(
      @Args('filter', { type: () => PartialInput }) filter: PartialInput,
    ): Promise<number> {
      return this.simpleService.count(filter);
    }
  }

  if (!options.noMutation) {
    @Resolver(() => Entity)
    class ResolverWithAutoSetters extends ResolverWithAutoGetters {
      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Create mutation`,
        name: `create${pascalCase(entityName)}`,
      })
      async create(
        @Args(
          camelCase(entityName),
          {
            type: () => Input,
          },
          AddTrackableCreationFields,
        )
        doc: typeof Input,
      ) {
        return this.simpleService.create(doc);
      }

      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Update one mutation`,
        name: `updateOne${pascalCase(entityName)}`,
      })
      async updateOne(
        @Args('filter', { type: () => PartialInput }) filter: PartialInput,
        @Args('update', { type: () => PartialInput }, AddTrackableUpdateFields)
        update: PartialInput,
      ) {
        return this.simpleService.updateOne(filter, update);
      }

      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Update many mutation`,
        name: `updateMany${pluralize(pascalCase(entityName))}`,
      })
      async updateMany(
        @Args('filter', { type: () => PartialInput }) filter: PartialInput,
        @Args('update', { type: () => PartialInput }, AddTrackableUpdateFields)
        update: PartialInput,
      ) {
        return this.simpleService.updateMany(filter, update);
      }

      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Find one and update mutation`,
        name: `findOneAndUpdate${pascalCase(entityName)}`,
      })
      async findOneAndUpdte(
        @Args('filter', { type: () => PartialInput }) filter: PartialInput,
        @Args('update', { type: () => PartialInput }, AddTrackableUpdateFields)
        update: PartialInput,
      ) {
        return this.simpleService.findOneAndUpdate(filter, update);
      }

      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Remove mutation`,
        name: `remove${pluralize(pascalCase(entityName))}`,
      })
      async remove(
        @Args('filter', { type: () => PartialInput }) filter: PartialInput,
      ) {
        return this.simpleService.remove(filter);
      }
    }

    setClassName(ResolverWithAutoSetters);
    return ResolverWithAutoSetters;
  }

  setClassName(ResolverWithAutoGetters);
  return ResolverWithAutoGetters;
}
