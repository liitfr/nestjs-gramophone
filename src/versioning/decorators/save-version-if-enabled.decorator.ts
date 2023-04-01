import { get } from 'lodash';

export const VERSION_DATA_INPUT = '[0].versionData';

export const SaveVersionIfEnabled = (versionDataPath = VERSION_DATA_INPUT) => {
  return function decorator(
    target: any,
    _propertyKey: string,
    descriptor: any, // PropertyDescriptor
  ): void {
    const originalMethod = descriptor.value;
    descriptor.value = async function wrapper(...args: any[]) {
      const result = await originalMethod.apply(this, args);
      if (this.versionerService) {
        const versionData = get(args, versionDataPath);
        await this.versionerService.saveVersion(result, versionData);
      }
      return result;
    };
  };
};
