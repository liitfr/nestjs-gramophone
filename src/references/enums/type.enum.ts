import { registerEnumType } from '@nestjs/graphql';

export enum TypeEnum {
  CoverPage = 'CoverPage',
  Normal = 'Normal',
  TableOfContents = 'TableOfContents',
}

registerEnumType(TypeEnum, {
  name: 'TypeEnum',
});
