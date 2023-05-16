import { defaultVersionDataGetter } from './save-version.decorator';
import type { VersionDataGetter } from './save-version.decorator';

export const SaveVersionIfEnabled = (
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
      const result = await originalMethod.apply(this, args);

      if (this.versioningService) {
        const versionData = versionDataGetter(...args);

        if (multiple) {
          for (const resultItem of result) {
            await this.versioningService.saveVersion(resultItem, versionData);
          }
        } else {
          await this.versioningService.saveVersion(result, versionData);
        }
      }

      return result;
    };
  };
};
