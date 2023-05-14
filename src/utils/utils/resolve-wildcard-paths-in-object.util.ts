import { get } from 'lodash';

export const resolveWildcardPathsInObject = (
  obj: object,
  wildcardPaths: string[],
) => {
  const realPaths: string[] = [];

  for (const wildcardPath of wildcardPaths) {
    if (wildcardPath.indexOf('[*]') !== -1) {
      const currentPaths: string[] = [];
      const steps = wildcardPath.split('.');

      for (const step of steps) {
        if (step === '[*]') {
          for (let i = 0; i < currentPaths.length; i++) {
            const currentNormalizedPath = currentPaths[i] || '';
            const currentNormalizedPathValue: unknown = get(
              obj,
              currentNormalizedPath,
            );

            if (currentNormalizedPathValue instanceof Array) {
              currentNormalizedPathValue.forEach((_, index) => {
                currentPaths.push(
                  currentNormalizedPath === ''
                    ? `${index}`
                    : `${currentNormalizedPath}.${index}`,
                );
              });
              currentPaths.splice(i, 1);
            }
          }
        } else {
          if (currentPaths.length === 0) {
            currentPaths.push(step);
          } else {
            currentPaths.forEach((currentNormalizedPath, i) => {
              currentPaths[i] = currentNormalizedPath + '[' + step + ']';
            });
          }
        }
      }

      realPaths.push(...currentPaths);
    } else {
      realPaths.push(wildcardPath);
    }
  }

  return realPaths;
};
