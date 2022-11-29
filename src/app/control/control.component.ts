import { Component, OnDestroy } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { Select, Store } from '@ngxs/store';

import { getIndexOfSpaceId, getTileIdBySpaceId } from '../shared/utils';
import { PaddleStreamer } from '../store/paddle-streamers/paddle-streamers.model';
import { PaddleStreamers } from '../store/paddle-streamers/paddle-streamers.actions';
import { PaddleStreamersState } from '../store/paddle-streamers/paddle-streamers.state';
import { Speed } from '../core/speed.model';
import { Tiles } from '../store/tiles/tiles.actions';
import { TileAngle } from '../core/tile-angle.model';
import { TileId } from '../core/tile-id.model';
import { TilesState } from '../store/tiles/tiles.state';

import { MAX_TILES_COUNT } from '../core/settings';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss']
})
export class ControlComponent implements OnDestroy {
  @Select(PaddleStreamersState.initialSpeed) readonly initialSpeed$!: Observable<Speed | undefined>;
  @Select(PaddleStreamersState.isFreeSpeedChangeUsed) readonly isFreeSpeedChangeUsed$!: Observable<boolean | undefined>;

  @Select(PaddleStreamersState.history) private readonly history$!: Observable<Array<TileAngle | string>>;
  @Select(PaddleStreamersState.currentPaddleStreamer) private readonly currentPaddleStreamer$!: Observable<PaddleStreamer | undefined>;
  @Select(TilesState.triggeredTileIds) private readonly triggeredTileIds$!: Observable<Array<TileId>>;

  history: Array<TileAngle | string> = [];
  paddleStreamer?: PaddleStreamer;

  private readonly ngUnsubscribe = new Subject<void>();
  private triggeredTileIds: Array<TileId> = new Array<TileId>();

  constructor(private confirmationService: ConfirmationService, private store: Store) {
    this.currentPaddleStreamer$
      .pipe(
        // distinct((paddleStreamer) => paddleStreamer?.color),
        map((paddleStreamer) => this.paddleStreamer = paddleStreamer),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe()
    ;

    this.history$
      .pipe(
        map((history) => this.history = history),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe()
    ;

    this.triggeredTileIds$
      .pipe(
        map((triggeredTileIds) => this.triggeredTileIds = triggeredTileIds),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe()
    ;
  }

  get historyAnglesCount(): number {
    return this.history.filter((item) => typeof item !== 'string').length;
  }

  get historySpacesCount(): number {
    return this.history.filter((item) => typeof item === 'string').length;
  }

  get movementPoints(): number {
    return this.paddleStreamer ? this.paddleStreamer.speed - this.historySpacesCount : 1;
  }

  confirmEndTurn(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Закончить ход?', // Are you sure that you want to proceed? // TODO: можно дописать, что осталось бесплатное изменение направления
      icon: 'fa-solid fa-triangle-exclamation text-red-600', // pi pi-exclamation-triangle
      accept: () => {
        this.endTurn();
      },
      acceptLabel: 'Да',
      rejectLabel: 'Нет'
    });
  }

  decrementSpeed(): void {
    this.store.dispatch(new PaddleStreamers.DecrementSpeed());
  }

  incrementSpeed(): void {
    this.store.dispatch(new PaddleStreamers.IncrementSpeed());
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  moveForward(): void {
    this.store.dispatch(new PaddleStreamers.MoveForward());
    const tileId = getTileIdBySpaceId(this.paddleStreamer?.currentSpaceId as string);
    const spaceIndex = getIndexOfSpaceId(this.paddleStreamer?.currentSpaceId as string);

    if (!tileId || !spaceIndex) {
      return;
    }

    // TODO: переделать по правилам всё это
    if (this.triggeredTileIds.length >= (MAX_TILES_COUNT - 1)) {
      if (!this.triggeredTileIds.includes(tileId) && // последний тайл не триггерит новый, поэтому такое условие
        spaceIndex >= 16 && spaceIndex <= 18
      ) {
        const timeoutId = setTimeout(() => {
          alert('Финиш!');
          clearTimeout(timeoutId);
        }, 100);
      }
    }
  }

  rotateLeft(): void {
    this.store.dispatch(new PaddleStreamers.RotateLeft());
  }

  rotateRight(): void {
    this.store.dispatch(new PaddleStreamers.RotateRight());
  }

  stepBack(): void {
    this.store.dispatch(new PaddleStreamers.StepBack());
  }

  private endTurn(): void {
    this.store.dispatch(new PaddleStreamers.EndTurn());
    const tileId = getTileIdBySpaceId(this.paddleStreamer?.currentSpaceId as string);

    if (!tileId) {
      return;
    }

    this.store.dispatch(new Tiles.AddTriggeredId(tileId));
    const timeoutId = setTimeout(() => {
      this.store.dispatch(new PaddleStreamers.TriggerScan());
      clearTimeout(timeoutId);
    }, 100);
  }
}
