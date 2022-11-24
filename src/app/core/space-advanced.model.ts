import { SpaceCore } from './space-core.model';
import { SpaceTypeAdvancedEnum } from './space-type-advanced.enum';

export interface SpaceAdvanced extends SpaceCore {
  type: SpaceTypeAdvancedEnum;
}
