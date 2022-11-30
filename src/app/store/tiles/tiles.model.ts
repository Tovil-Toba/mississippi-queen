import { TileComponent } from '../../shared/tile-component.model';
import { TileId } from '../../core/tile-id.model';

export class TilesStateModel {
  finishSpaceIds!: string[];
  tiles!: Array<TileComponent>;
  triggeredTileIds!: Array<TileId>;
}
