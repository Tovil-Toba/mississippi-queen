import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';

import { PaddleStreamersState } from '../store/paddle-streamers/paddle-streamers.state';
import { SpaceIndex } from '../core/space-index.model';
import { TileAngle } from '../core/tile-angle.model';
import { TileId } from '../core/tile-id.model';

@Component({
  selector: 'app-space',
  templateUrl: './space.component.html',
  styleUrls: ['./space.component.scss']
})
export class SpaceComponent {
  @Input() centerLeft!: number;
  @Input() centerTop!: number;
  @Input() currentSpaceId?: string | null;
  @Input() id!: string;
  @Input() index!: SpaceIndex;
  @Input() tileAngle!: TileAngle;
  @Input() tileId!: TileId;
  @Input() tileSize?: number = 256;

  // @Select(PaddleStreamersState.currentSpaceId) currentSpaceId$!: Observable<string | undefined>;
  // isHighlightHidden = true;
  isHighlightVisible?: boolean;

  constructor(private store: Store) { }

  get size(): number {
    return 0.1375 * (this.tileSize as number);
  }

  get highlightHeight(): number {
    return 0.21 * (this.tileSize as number);
  }

  get highlightWidth(): number {
    return 0.24 * (this.tileSize as number);
  }

  setCurrentSpaceId(): void {
    // закомментировано, чтобы пользователь вручную управлял пароходиком. выпилить в будущем
    // new PaddleStreamers.SetCurrentSpaceId(this.id);
  }
}
