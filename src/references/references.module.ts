import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MongoRepositoryFactory } from '../data/factories/mongo-repository.factory';

import { TypesServiceProviders } from './services/types.service';
import { ColorsServiceProviders } from './services/colors.service';
import { ReferencesServiceProviders } from './services/references.service';
import { TypesResolver } from './resolvers/types.resolver';
import { ColorsResolver } from './resolvers/colors.resolver';
import { ReferencesResolver } from './resolvers/references.resolver';
import { AllReferencesResolver } from './resolvers/all-references.resolver';
import { Type, TypeSchema } from './entities/type.entity';
import { Color, ColorSchema } from './entities/color.entity';
import { Reference, ReferenceSchema } from './entities/reference.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Type.name, schema: TypeSchema }]),
    MongooseModule.forFeature([{ name: Color.name, schema: ColorSchema }]),
    MongooseModule.forFeature([
      { name: Reference.name, schema: ReferenceSchema },
    ]),
  ],
  providers: [
    MongoRepositoryFactory(Type),
    MongoRepositoryFactory(Color),
    MongoRepositoryFactory(Reference),
    ...TypesServiceProviders,
    ...ColorsServiceProviders,
    ...ReferencesServiceProviders,
    TypesResolver,
    ColorsResolver,
    ReferencesResolver,
    AllReferencesResolver,
  ],
  exports: [
    ...TypesServiceProviders,
    ...ColorsServiceProviders,
    ...ReferencesServiceProviders,
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ReferencesModule {}
