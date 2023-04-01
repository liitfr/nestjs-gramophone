import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

import {
  ENTITY_METADATA,
  EntityMetadata,
  enhancerCheckerFactory,
  getEntityMetadata,
} from './entity.util';
import { generateCollectionName } from '../string.util';
import { SetMetadata } from '@nestjs/common';

const IS_MEMOABLE = 'IS_MEMOABLE';

export interface Memoable {
  memo?: string;
}

export const checkIfIsMemoable = enhancerCheckerFactory<Memoable>(IS_MEMOABLE);

export function Memoable() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const originalMetadata = getEntityMetadata(constructor);
    const { entityName, entityDescription, entityEnhancers } = originalMetadata;

    @SetMetadata<symbol, EntityMetadata>(ENTITY_METADATA, {
      ...originalMetadata,
      entityEnhancers: [...(entityEnhancers || []), IS_MEMOABLE],
    })
    @ObjectType(entityName)
    @Schema({ collection: generateCollectionName(entityName) })
    class Memoed extends constructor implements Memoable {
      @Field({
        nullable: true,
        description: `${entityDescription}'s memo`,
      })
      @Prop({
        type: String,
        required: false,
      })
      memo?: string;

      @Field({
        nullable: true,
        description: `${entityDescription}'s internal memo`,
      })
      @Prop({
        type: String,
        required: false,
      })
      internalMemo?: string;

      @Field({
        nullable: true,
        description: `${entityDescription}'s automatic memo`,
        defaultValue: 'Memo automatique généré via GraphQL',
      })
      @Prop({
        type: String,
        required: true,
      })
      automaticMemo: string;
    }

    Object.defineProperty(Memoed, 'name', { value: constructor.name });

    return Memoed;
  };
}
