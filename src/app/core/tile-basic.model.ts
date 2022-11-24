import { SpaceBasic } from './space-basic.model';
import { TileIdBasic } from './tile-id-basic.model';

export interface TileBasic {
  id: TileIdBasic;
  spaces: Array <SpaceBasic>;
}
