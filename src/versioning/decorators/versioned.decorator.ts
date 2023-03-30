import { Type } from '@nestjs/common';
import { checkIfIsTrackable } from 'src/utils/decorators/trackable.decorator';

export const versioners: {
  serviceName: string;
  Entity: Type<unknown>;
}[] = [];

export function Versioned(Entity: Type<unknown>) {
  if (!checkIfIsTrackable(Entity)) {
    throw new Error('Entity must be trackable to be versioned');
  }
  return (constructor: any) => {
    const serviceName = constructor.name;
    if (!versioners.find((v) => v.serviceName === serviceName)) {
      versioners.push({ serviceName, Entity });
    }
  };
}
