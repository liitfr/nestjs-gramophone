import { camelCase, startCase } from 'lodash';
import { pluralize } from 'mongoose';

export const generateCollectionName = pluralize();

export { camelCase };

export const pascalCase = (str: string) =>
  startCase(camelCase(str)).replace(/ /g, '');
