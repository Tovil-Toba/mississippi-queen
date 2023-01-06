import { Component, OnDestroy } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { Select, Store } from '@ngxs/store';

import { getTileIdBySpaceId } from '../shared/utils';
import { PaddleSteamer } from '../core/paddle-steamer.model';
import { PaddleSteamers } from '../store/paddle-steamers/paddle-steamers.actions';
import { PaddleSteamersState } from '../store/paddle-steamers/paddle-steamers.state';
import { Speed } from '../core/speed.model';
import { Tiles } from '../store/tiles/tiles.actions';
import { TileAngle } from '../core/tile-angle.model';
import { TileId } from '../core/tile-id.model';
import { TilesState } from '../store/tiles/tiles.state';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss']
})
export class ControlComponent implements OnDestroy {
  @Select(PaddleSteamersState.initialSpeed) readonly initialSpeed$!: Observable<Speed | undefined>;
  @Select(PaddleSteamersState.isFreeSpeedChangeUsed) readonly isFreeSpeedChangeUsed$!: Observable<boolean | undefined>;

  @Select(PaddleSteamersState.history) private readonly history$!: Observable<Array<TileAngle | string>>;
  @Select(PaddleSteamersState.currentPaddleSteamer) private readonly currentPaddleSteamer$!: Observable<PaddleSteamer | undefined>;
  @Select(TilesState.triggeredTileIds) private readonly triggeredTileIds$!: Observable<Array<TileId>>;

  history: Array<TileAngle | string> = [];
  paddleSteamer?: PaddleSteamer;

  private readonly ngUnsubscribe = new Subject<void>();
  private triggeredTileIds: Array<TileId> = [];

  constructor(private confirmationService: ConfirmationService, private store: Store) {
    this.currentPaddleSteamer$
      .pipe(
        // distinct((paddleSteamer) => paddleSteamer?.color),
        map((paddleSteamer) => this.paddleSteamer = paddleSteamer),
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
    return this.paddleSteamer ? this.paddleSteamer.speed - this.historySpacesCount : 1;
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
    this.store.dispatch(new PaddleSteamers.DecrementSpeed());
  }

  incrementSpeed(): void {
    this.store.dispatch(new PaddleSteamers.IncrementSpeed());
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  moveForward(): void {
    this.store.dispatch(new PaddleSteamers.MoveForward());
  }

  rotateLeft(): void {
    this.store.dispatch(new PaddleSteamers.RotateLeft());
  }

  rotateRight(): void {
    this.store.dispatch(new PaddleSteamers.RotateRight());
  }

  stepBack(): void {
    this.store.dispatch(new PaddleSteamers.StepBack());
  }

  private endTurn(): void {
    this.store.dispatch(new PaddleSteamers.EndTurn());
    const tileId = getTileIdBySpaceId(this.paddleSteamer?.currentSpaceId as string);

    if (!tileId) {
      return;
    }

    this.store.dispatch(new Tiles.AddTriggeredId(tileId));
    const timeoutId = setTimeout(() => {
      this.store.dispatch(new PaddleSteamers.TriggerScan());
      clearTimeout(timeoutId);
    }, 100);
  }
}
