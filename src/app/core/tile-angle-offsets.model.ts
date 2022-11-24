import { Coordinates } from './coordinates.model';
import { TileAngle } from './tile-angle.model';

export type TileAngleOffsets = {
  [angle in TileAngle]: Coordinates
};
