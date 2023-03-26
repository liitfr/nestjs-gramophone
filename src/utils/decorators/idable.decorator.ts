import { Field, ObjectType } from '@nestjs/graphql';
import { Schema } from '@nestjs/mongoose';
import { Types as MongooseTypes } from 'mongoose';

import {
  EntityDecorator,
  entityDescription,
  entityName,
  getEntityDescription,
  getEntityName,
} from '../entity-decorator';
import { pluralizeEntityName } from '../pluralize-entity-name';
import { MongoObjectIdScalar } from '../scalars/mongo-id.scalar';

export interface Idable {
  _id: MongooseTypes.ObjectId;
}

export function Idable() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const entityNameValue = getEntityName(constructor);
    const entityDescriptionValue = getEntityDescription(constructor);

    @ObjectType(entityNameValue)
    @Schema({ collection: pluralizeEntityName(entityNameValue) })
    class Ided extends constructor implements EntityDecorator {
      static [entityName] = entityNameValue;
      static [entityDescription] = entityDescriptionValue;

      @Field(() => MongoObjectIdScalar, {
        nullable: false,
        description: `${entityDescriptionValue}\'s id`,
      })
      _id: MongooseTypes.ObjectId;
    }

    Object.defineProperty(Ided, 'name', { value: constructor.name });

    return Ided;
  };
}
