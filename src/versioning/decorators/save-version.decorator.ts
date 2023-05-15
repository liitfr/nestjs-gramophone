import { get } from 'lodash';

import { VersionDataInput } from '../dtos/version-data.input';
import { CustomError, ErrorCode } from '../../utils/errors/custom.error';

export const VERSION_DATA_FIELDNAME = 'versionData';
export const VERSION_DATA_PATH = `[0].${VERSION_DATA_FIELDNAME}`;

type VersionDataGetter = (...args: any[]) => VersionDataInput;

export const SaveVersion = (
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
      if (!this.versioningService) {
        throw new CustomError(
          'Entity versioning is not enabled.',
          ErrorCode.INTERNAL_SERVER_ERROR,
          {
            fr: "Le versionage des entités n'est pas activé.",
          },
          {
            service: 'SaveVersion',
          },
        );
      }

      const result = await originalMethod.apply(this, args);

      const versionData = versionDataGetter(...args);
      await this.versioningService.saveVersion(result, versionData);

      return result;
    };
  };
};
