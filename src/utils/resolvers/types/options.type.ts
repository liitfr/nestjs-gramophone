import { CountAllOptions } from '../decorators/count-all.decorator';
import { CountSomeOptions } from '../decorators/count-some.decorator';
import { CreateOptions } from '../decorators/create.decorator';
import { FindAllOptions } from '../decorators/find-all.decorator';
import { FindOneAndUpdateOptions } from '../decorators/find-one-and-update.decorator';
import { FindOneOptions } from '../decorators/find-one.decorator';
import { FindSomeOptions } from '../decorators/find-some.decorator';
import { RelationPartitionCountOptions } from '../decorators/relation-partition-count.decorator';
import { RelationPartitionFindOptions } from '../decorators/relation-partition-find.decorator';
import { RelationResolveOptions } from '../decorators/relation-resolve.decorator';
import { RemoveOptions } from '../decorators/remove.decorator';
import { ReversedRelationIdOptions } from '../decorators/reversed-relation-id.decorator';
import { ReversedRelationResolveOptions } from '../decorators/reversed-relation-resolve.decorator';
import { UpdateManyOptions } from '../decorators/update-many.decorator';
import { UpdateOneOptions } from '../decorators/update-one.decorator';
import { GeneralOptions } from '../options/general-options';

export interface ResolverOptions<E extends object> {
  general?: GeneralOptions;
  countAll?: false | CountAllOptions;
  countSome?: false | CountSomeOptions<E>;
  create?: false | CreateOptions<E>;
  findAll?: false | FindAllOptions;
  findOneAndUpdate?: false | FindOneAndUpdateOptions<E>;
  findOne?: false | FindOneOptions;
  findSome?: false | FindSomeOptions<E>;
  relationPartitionCount?: false | RelationPartitionCountOptions;
  relationPartitionFind?: false | RelationPartitionFindOptions;
  relationResolve?: false | RelationResolveOptions;
  remove?: false | RemoveOptions<E>;
  reversedRelationId?: false | ReversedRelationIdOptions;
  reversedRelationResolve?: false | ReversedRelationResolveOptions;
  updateMany?: false | UpdateManyOptions<E>;
  updateOne?: false | UpdateOneOptions<E>;
}
