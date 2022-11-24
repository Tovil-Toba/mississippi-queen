import { TileComponent } from '../../shared/tile-component.model';
import { TileId } from '../../core/tile-id.model';

export class TilesStateModel {
  public newTileTrigger!: number;
  public tiles!: Array<TileComponent>;
  public triggeredTileIds!: Array<TileId>;
}
