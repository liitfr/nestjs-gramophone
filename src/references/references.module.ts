import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

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
import { TypesRepository } from './repositories/abstract/types.repository';
import { TypesMongoRepository } from './repositories/mongo/types.repository';
import { ColorsRepository } from './repositories/abstract/colors.repository';
import { ColorsMongoRepository } from './repositories/mongo/colors.repository';
import { ReferencesRepository } from './repositories/abstract/references.repository';
import { ReferencesMongoRepository } from './repositories/mongo/references.repository';
import { AllReferences } from './entities/all-references.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Type.name, schema: TypeSchema }]),
    MongooseModule.forFeature([{ name: Color.name, schema: ColorSchema }]),
    MongooseModule.forFeature([
      { name: Reference.name, schema: ReferenceSchema },
    ]),
  ],
  providers: [
    AllReferences,
    { provide: TypesRepository, useClass: TypesMongoRepository },
    { provide: ColorsRepository, useClass: ColorsMongoRepository },
    { provide: ReferencesRepository, useClass: ReferencesMongoRepository },
    TypesService,
    ColorsService,
    ReferencesService,
    TypesResolver,
    ColorsResolver,
    ReferencesResolver,
    AllReferencesResolver,
  ],
  exports: [],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ReferencesModule {}
