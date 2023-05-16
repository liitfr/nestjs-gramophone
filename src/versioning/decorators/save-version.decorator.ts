import { get } from 'lodash';

import { VersionDataInput } from '../dtos/version-data.input';
import { CustomError, ErrorCode } from '../../utils/errors/custom.error';

export const VERSION_DATA_FIELDNAME = 'versionData';
export const VERSION_DATA_PATH = `[0].${VERSION_DATA_FIELDNAME}`;

export type VersionDataGetter = (...args: any[]) => VersionDataInput;

export const defaultVersionDataGetter = (...args: any[]) =>
  get(args, VERSION_DATA_PATH);

export const SaveVersion = (
  {
    versionDataGetter = defaultVersionDataGetter,
    multiple = false,
  }: {
    versionDataGetter?: VersionDataGetter;
    multiple?: boolean;
  } = {
    versionDataGetter: defaultVersionDataGetter,
    multiple: false,
  },
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

      if (multiple) {
        for (const resultItem of result) {
          await this.versioningService.saveVersion(resultItem, versionData);
        }
      } else {
        await this.versioningService.saveVersion(result, versionData);
      }

      return result;
    };
  };
};
