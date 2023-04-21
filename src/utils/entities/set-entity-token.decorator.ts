import { SetMetadata } from '@nestjs/common';

import { Constructor } from '../types/constructor.type';

import { ENTITY_METADATA } from './entity.util';

export function SetEntityToken(entityToken: symbol | undefined) {
  return <T extends Constructor>(constructor: T) => {
    SetMetadata<symbol, { entityToken: symbol }>(ENTITY_METADATA, {
      entityToken: entityToken ?? Symbol(constructor.name),
    })(constructor);
    return constructor;
  };
}
