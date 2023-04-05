import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MongoRepositoryFactory } from '../data/factories/mongo-repository.factory';

import { TypesService } from './services/types.service';
import { ColorsService } from './services/colors.service';
import { ReferencesService } from './services/references.service';
import { TypesResolver } from './resolvers/types.resolver';
import { ColorsResolver } from './resolvers/colors.resolver';
import { ReferencesResolver } from './resolvers/references.resolver';
import { AllReferencesResolver } from './resolvers/all-references.resolver';
import { Type, TypeSchema } from './entities/type.entity';
import { Color, ColorSchema } from './entities/color.entity';
import { Reference, ReferenceSchema } from './entities/reference.entity';

const TypesServiceAlias = {
  provide: 'TypesService',
  useExisting: TypesService,
};

const ColorsServiceAlias = {
  provide: 'ColorsService',
  useExisting: ColorsService,
};

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
    TypesService,
    TypesServiceAlias,
    ColorsService,
    ColorsServiceAlias,
    ReferencesService,
    TypesResolver,
    ColorsResolver,
    ReferencesResolver,
    AllReferencesResolver,
  ],
  exports: [
    ReferencesService,
    ColorsServiceAlias,
    TypesServiceAlias,
    ColorsService,
    TypesService,
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ReferencesModule {}
