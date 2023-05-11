import {
  Idable,
  Trackable,
} from '../../utils/entities/simple-entity.decorator';

export interface IdableAndTrackable extends Trackable, Idable {}
