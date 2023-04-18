import { get } from 'lodash';

export const VERSION_DATA_FIELDNAME = 'versionData';
export const VERSION_DATA_PATH = `[0].${VERSION_DATA_FIELDNAME}`;

export const SaveVersionIfEnabled = (versionDataPath = VERSION_DATA_PATH) => {
  return function decorator(
    _target: any,
    _propertyKey: string,
    descriptor: any, // PropertyDescriptor
  ): void {
    const originalMethod = descriptor.value;
    descriptor.value = async function wrapper(...args: any[]) {
      const result = await originalMethod.apply(this, args);
      if (this.versioningService) {
        const versionData = get(args, versionDataPath);
        await this.versioningService.saveVersion(result, versionData);
      }
      return result;
    };
  };
};
