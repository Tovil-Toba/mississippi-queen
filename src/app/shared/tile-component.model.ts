import { TileAngle } from '../core/tile-angle.model';
import { TileId } from '../core/tile-id.model';

export interface TileComponent {
  angle: TileAngle;
  id: TileId;
  left: number;
  top: number;
}
