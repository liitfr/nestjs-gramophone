import { Type } from '@nestjs/common';

export const versioners: {
  serviceName: string;
  Entity: Type<unknown>;
}[] = [];

export function Versioned(Entity: Type<unknown>) {
  return (constructor: any) => {
    const serviceName = constructor.name;
    if (!versioners.find((v) => v.serviceName === serviceName)) {
      versioners.push({ serviceName, Entity });
    }
  };
}
