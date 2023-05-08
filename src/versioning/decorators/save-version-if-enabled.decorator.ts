import { get } from 'lodash';

import { VersionDataInput } from '../dtos/version-data.input';

export const VERSION_DATA_FIELDNAME = 'versionData';
export const VERSION_DATA_PATH = `[0].${VERSION_DATA_FIELDNAME}`;

type VersionDataGetter = (...args: any[]) => VersionDataInput;

export const SaveVersionIfEnabled = (
  versionDataGetter: VersionDataGetter = (...args: any[]) =>
    get(args, VERSION_DATA_PATH),
) => {
  return function decorator(
    _target: any,
    _propertyKey: string,
    descriptor: any, // PropertyDescriptor
  ): void {
    const originalMethod = descriptor.value;

    descriptor.value = async function wrapper(...args: any[]) {
      const result = await originalMethod.apply(this, args);

      if (this.versioningService) {
        const versionData = versionDataGetter(...args);
        await this.versioningService.saveVersion(result, versionData);
      }

      return result;
    };
  };
};
