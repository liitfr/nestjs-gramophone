import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TypesService } from './type/services/types.service';
import { TypesResolver } from './type/resolvers/types.resolver';
import { Type, TypeSchema } from './type/models/type.model';
import { TypesRepository } from './type/repositories/abstract/types.repository';
import { TypesMongoRepository } from './type/repositories/mongo/types.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Type.name, schema: TypeSchema }]),
  ],
  providers: [
    { provide: TypesRepository, useClass: TypesMongoRepository },
    TypesService,
    TypesResolver,
  ],
  exports: [],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ReferencesModule {}
