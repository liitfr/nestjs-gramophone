import { Inject } from '@nestjs/common';

import { getEntityName } from '../../utils/entity-decorator';

export const SaveVersion = (versionDataInput = 'versionData') => {
  const decorator = (
    target: any,
    _propertyKey: string,
    descriptor: any, // PropertyDescriptor
  ): void => {
    const versionerServiceInjector = Inject(
      `VersioningServiceFor${getEntityName(target.constructor)}`,
    );
    versionerServiceInjector(target, 'versionerService');
    const originalMethod = descriptor.value;
    descriptor.value = async function wrapper(...args: any[]) {
      const result = await originalMethod.apply(this, args);
      const versionData = args[0][versionDataInput];
      await this.versionerService.saveVersion(result, versionData);
      return result;
    };
  };

  return decorator;
};
