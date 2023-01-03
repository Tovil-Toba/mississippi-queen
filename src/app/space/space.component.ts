import { Component, Input, OnDestroy } from '@angular/core';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngxs/store';
import { TileSize } from '../core/tile-size.model';

import { PaddleStreamer } from '../core/paddle-streamer.model';
import { PaddleStreamersState } from '../store/paddle-streamers/paddle-streamers.state';
import { SpaceIndex } from '../core/space-index.model';
import { TileAngle } from '../core/tile-angle.model';
import { TileId } from '../core/tile-id.model';

import { TILE_SIZE } from '../core/default-settings';

@Component({
  selector: 'app-space',
  templateUrl: './space.component.html',
  styleUrls: ['./space.component.scss']
})
export class SpaceComponent implements OnDestroy {
  @Input() centerLeft!: number;
  @Input() centerTop!: number;
  @Input() id!: string;
  @Input() index!: SpaceIndex;
  @Input() tileAngle!: TileAngle;
  @Input() tileId!: TileId;
  @Input() tileSize?: TileSize = TILE_SIZE;

  // isHighlightHidden = true;
  isHighlightVisible?: boolean;
  paddleStreamer$?: Observable<PaddleStreamer | undefined>;

  private ngUnsubscribe = new Subject<void>();

  constructor(private store: Store) {
    this.paddleStreamer$ = store
      .select(PaddleStreamersState.paddleStreamer)
      .pipe(
        map(filterFn => filterFn(this.id)),
        takeUntil(this.ngUnsubscribe)
      )
    ;
  }

  get size(): number {
    return 0.1375 * (this.tileSize as number);
  }

  get highlightHeight(): number {
    return 0.21 * (this.tileSize as number);
  }

  get highlightWidth(): number {
    return 0.24 * (this.tileSize as number);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  setCurrentSpaceId(): void {
    // закомментировано, чтобы пользователь вручную управлял пароходиком. выпилить в будущем
    // new PaddleStreamers.SetCurrentSpaceId(this.id);
  }
}
