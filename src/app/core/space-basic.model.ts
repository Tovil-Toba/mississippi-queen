import { SpaceCore } from './space-core.model';
import { SpaceIndex } from './space-index.model';
import { SpaceTypeBasicEnum } from './space-type-basic.enum';

export interface SpaceBasic extends SpaceCore {
  islandIndexes?: Array<SpaceIndex>;
  type: SpaceTypeBasicEnum;
}
