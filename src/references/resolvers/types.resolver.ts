import { Type } from '../entities/type.entity';
import { TypesService } from '../services/types.service';
import { TypeInput } from '../dtos/type.input';
import { SimpleReferenceResolverFactory } from '../factories/simple-reference-resolver.factory';

export const TypesResolverProvider = {
  provide: 'TypesResolver',
  useClass: SimpleReferenceResolverFactory(Type, TypeInput, TypesService),
};
