import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TypesService } from './services/types.service';
import { TypesResolver } from './resolvers/types.resolver';
import { Type, TypeSchema } from './models/type.model';
import { Color, ColorSchema } from './models/color.model';
import { TypesRepository } from './repositories/abstract/types.repository';
import { TypesMongoRepository } from './repositories/mongo/types.repository';
import { ColorsService } from './services/colors.service';
import { ColorsResolver } from './resolvers/colors.resolver';
import { ColorsRepository } from './repositories/abstract/colors.repository';
import { ColorsMongoRepository } from './repositories/mongo/colors.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Type.name, schema: TypeSchema }]),
    MongooseModule.forFeature([{ name: Color.name, schema: ColorSchema }]),
  ],
  providers: [
    { provide: TypesRepository, useClass: TypesMongoRepository },
    { provide: ColorsRepository, useClass: ColorsMongoRepository },
    TypesService,
    ColorsService,
    TypesResolver,
    ColorsResolver,
  ],
  exports: [],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ReferencesModule {}
