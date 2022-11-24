import { TileDirectionEnum } from './tile-direction.enum';
import { SpaceIndex } from './space-index.model';

// TODO: А надо ли это???
export type Tracks = {
  [direction in TileDirectionEnum]: Array<Array<SpaceIndex>>
}
