import { Space } from './space.model';
import { TileId } from './tile-id.model';

export interface Tile {
  id: TileId;
  spaces: Array <Space>;
}
