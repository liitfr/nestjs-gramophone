import { cloneDeep } from 'lodash';

import { Id } from '../../types/id.type';
import { EntityStore } from '../../entities/entity-store.service';
import { STHandle } from '../../types/handle.type';
import { checkIfIsTrackable } from '../../entities/simple-entity.decorator';

import {
  PartialSimpleApiInputObj,
  SimpleApiInputObj,
} from '../types/simple-api-input.type';
import { SimpleRepositoryInputObj } from '../types/simple-repository-input.type';

interface CreationTrackableData {
  createdAt: Date;
  creatorId: Id;
  updatedAt: Date;
  updaterId: Id;
}

interface UpdateTrackableData {
  updatedAt: Date;
  updaterId: Id;
}

interface CreationParameters<E extends object> {
  obj: SimpleApiInputObj<E>;
  Entity: STHandle<E>;
  trackableData: CreationTrackableData;
}

interface UpdateParameters<E extends object> {
  obj: PartialSimpleApiInputObj<E>;
  Entity: STHandle<E>;
  trackableData: UpdateTrackableData;
}

export const addTrackableData = <E extends object>({
  obj,
  Entity,
  trackableData,
}: CreationParameters<E> | UpdateParameters<E>) => {
  const copy = cloneDeep(obj);

  const entityMetadata = EntityStore.get(Entity);

  if (entityMetadata.nestedEntities) {
    for (const nestedEntity of entityMetadata.nestedEntities) {
      const { target, details } = nestedEntity;
      const nestedEntityWithTrackableData = addTrackableData({
        obj: obj[details.fieldName],
        Entity: target,
        trackableData,
      });
      copy[details.fieldName] = nestedEntityWithTrackableData;
    }
  }

  if (checkIfIsTrackable(Entity)) {
    Object.assign(copy, trackableData);
  }

  return copy as SimpleRepositoryInputObj<E>;
};
