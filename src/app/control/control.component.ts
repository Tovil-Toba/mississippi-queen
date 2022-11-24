import { Component, OnDestroy } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Select, Store } from '@ngxs/store';

import { getIndexOfSpaceId, getTileIdBySpaceId } from '../shared/utils';
import { PaddleStreamers } from '../store/paddle-streamers/paddle-streamers.actions';
import { PaddleStreamersState } from '../store/paddle-streamers/paddle-streamers.state';
import { Tiles } from '../store/tiles/tiles.actions';
import { TileId } from '../core/tile-id.model';
import { TilesState } from '../store/tiles/tiles.state';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss']
})
export class ControlComponent implements OnDestroy {
  @Select(PaddleStreamersState.currentSpaceId) private currentSpaceId$!: Observable<string | undefined>;
  @Select(PaddleStreamersState.forwardSpaceId) private forwardSpaceId$!: Observable<string | undefined>;
  @Select(TilesState.triggeredTileIds) private triggeredTileIds$!: Observable<Array<TileId>>;

  forwardSpaceId?: string;

  private currentSpaceId?: string;
  private ngUnsubscribe = new Subject<void>();
  private triggeredTileIds: Array<TileId> = new Array<TileId>();

  constructor(private store: Store) {
    this.currentSpaceId$
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((currentSpaceId) => {
        this.currentSpaceId = currentSpaceId;
      })
    ;

    this.forwardSpaceId$
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((forwardSpaceId) => {
        this.forwardSpaceId = forwardSpaceId;
      })
    ;

    this.triggeredTileIds$
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((triggeredTileIds) => {
        this.triggeredTileIds = triggeredTileIds;
      })
    ;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  moveForward(): void {
    console.log('Двигаться вперёд');
    this.store.dispatch(new PaddleStreamers.MoveForward());
    const tileId = getTileIdBySpaceId(this.currentSpaceId as string);
    const spaceIndex = getIndexOfSpaceId(this.currentSpaceId as string);

    if (!tileId || !spaceIndex) {
      return;
    }

    // todo: отрефакторить покрасивее все это
    if (this.triggeredTileIds.length >= (12 - 1)) { // todo: в будущем макс кол-во тайлов будет браться из настроек
      if (!this.triggeredTileIds.includes(tileId) && // последний тайл не триггерит новый, поэтому такое условие
        spaceIndex >= 16 && spaceIndex <= 18
      ) {
        const timeoutId = setTimeout(() => {
          alert('Финиш!');
          clearTimeout(timeoutId);
        }, 100);
      }
    } else if (
      !this.triggeredTileIds.includes(tileId) &&
      spaceIndex >= 15 &&
      spaceIndex <= 19
    ) {
      this.store.dispatch(new Tiles.AddTriggeredId(tileId));
      this.store.dispatch(new Tiles.TriggerNew());
      const timeoutId = setTimeout(() => {
        this.store.dispatch(new PaddleStreamers.TriggerScan());
        clearTimeout(timeoutId);
      }, 100);
    }
  }

  rotateLeft(): void {
    console.log('Повернуть налево');
    this.store.dispatch(new PaddleStreamers.RotateLeft());
  }

  rotateRight(): void {
    console.log('Повернуть направо');
    this.store.dispatch(new PaddleStreamers.RotateRight());
  }
}
