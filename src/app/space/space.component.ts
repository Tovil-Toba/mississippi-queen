import { Component, Input, OnDestroy } from '@angular/core';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngxs/store';
import { TileSize } from '../core/tile-size.model';

import { PaddleSteamer } from '../core/paddle-steamer.model';
import { PaddleSteamersState } from '../store/paddle-steamers/paddle-steamers.state';
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
  paddleSteamer$?: Observable<PaddleSteamer | undefined>;

  private ngUnsubscribe = new Subject<void>();

  constructor(private store: Store) {
    this.paddleSteamer$ = store
      .select(PaddleSteamersState.paddleSteamer)
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
    // new PaddleSteamers.SetCurrentSpaceId(this.id);
  }
}
