import {
  Args,
  Resolver,
  Query,
  Mutation,
  InputType,
  PartialType,
  Int,
} from '@nestjs/graphql';
import { Type } from '@nestjs/common';

import { IdScalar } from '../scalars/id.scalar';

import {
  getEntityDescription,
  getEntityName,
} from '../entity-enhancers/enhancers.util';
import { SimpleService } from '../services/simple.service';
import { camelCase, pascalCase, pluralize } from '../string.util';
import { Id } from '../id.type';
import { AddTrackableCreationFields } from '../pipes/add-trackable-creation-fields.pipe';
import { AddTrackableUpdateFields } from '../pipes/add-trackable-update-fields.pipe';

export function SimpleResolverFactory(
  Entity: Type<unknown>,
  Input: Type<unknown>,
) {
  const entityDescriptionValue = getEntityDescription(Entity);
  const entityNameValue = getEntityName(Entity);

  @InputType(`${entityNameValue}PartialInput`)
  class PartialInput extends PartialType(Input) {}

  @Resolver(() => Entity)
  abstract class SimpleResolver<D> {
    constructor(readonly simpleService: SimpleService<D>) {}

    @Query(() => Entity, {
      nullable: false,
      description: `${entityDescriptionValue} : Get one query`,
      name: `getOne${pascalCase(entityNameValue)}`,
    })
    async getOne(@Args('id', { type: () => IdScalar }) id: Id): Promise<D> {
      return this.simpleService.findById(id);
    }

    @Query(() => [Entity], {
      nullable: false,
      description: `${entityDescriptionValue} : Get all query`,
      name: `getAll${pluralize(pascalCase(entityNameValue))}`,
    })
    async getAll(): Promise<D[]> {
      return this.simpleService.findAll();
    }

    @Query(() => [Entity], {
      nullable: false,
      description: `${entityDescriptionValue} : Get some query`,
      name: `getSome${pluralize(pascalCase(entityNameValue))}`,
    })
    async getSome(
      @Args('filter', { type: () => PartialInput }) filter: PartialInput,
    ): Promise<D[]> {
      return this.simpleService.find(filter);
    }

    @Query(() => Int, {
      nullable: false,
      description: `${entityDescriptionValue} : Count all query`,
      name: `countAll${pluralize(pascalCase(entityNameValue))}`,
    })
    async countAll(): Promise<number> {
      return this.simpleService.countAll();
    }

    @Query(() => Int, {
      nullable: false,
      description: `${entityDescriptionValue} : Count some query`,
      name: `countSome${pluralize(pascalCase(entityNameValue))}`,
    })
    async countSome(
      @Args('filter', { type: () => PartialInput }) filter: PartialInput,
    ): Promise<number> {
      return this.simpleService.count(filter);
    }

    @Mutation(() => Entity, {
      nullable: false,
      description: `${entityDescriptionValue} : Create mutation`,
      name: `create${pascalCase(entityNameValue)}`,
    })
    async create(
      @Args(
        camelCase(entityNameValue),
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
      description: `${entityDescriptionValue} : Update one mutation`,
      name: `updateOne${pascalCase(entityNameValue)}`,
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
      description: `${entityDescriptionValue} : Update many mutation`,
      name: `updateMany${pluralize(pascalCase(entityNameValue))}`,
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
      description: `${entityDescriptionValue} : Find one and update mutation`,
      name: `findOneAndUpdate${pascalCase(entityNameValue)}`,
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
      description: `${entityDescriptionValue} : Remove mutation`,
      name: `remove${pluralize(pascalCase(entityNameValue))}`,
    })
    async remove(
      @Args('filter', { type: () => PartialInput }) filter: PartialInput,
    ) {
      return this.simpleService.remove(filter);
    }
  }

  return SimpleResolver;
}
