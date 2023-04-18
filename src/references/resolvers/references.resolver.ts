import { Reference } from '../entities/reference.entity';
import { ReferenceInput } from '../dtos/reference.input';
import { ReferencesService } from '../services/references.service';
import { SimpleReferenceResolverFactory } from '../factories/simple-reference-resolver.factory';

export const ReferencesResolverProvider = {
  provide: 'ReferencesResolver',
  useClass: SimpleReferenceResolverFactory(
    Reference,
    ReferenceInput,
    ReferencesService,
  ),
};
