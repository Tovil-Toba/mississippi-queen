import { SpaceAdvanced } from './space-advanced.model';
import { TileIdAdvanced } from './tile-id-advanced.model';

export interface TileAdvanced {
  id: TileIdAdvanced;
  spaces: Array <SpaceAdvanced>;
}
