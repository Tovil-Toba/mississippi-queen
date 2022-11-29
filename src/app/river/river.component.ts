import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { filter, map, Observable, Subject, takeUntil } from 'rxjs';
import { Select, Store } from '@ngxs/store';

import { Coordinates } from '../core/coordinates.model';
import { getRandomTileDirection, shuffleArray } from '../shared/utils';
import { PaddleStreamer } from '../store/paddle-streamers/paddle-streamers.model';
import { PaddleStreamerColorEnum } from '../shared/paddle-streamer-color.enum';
import { PaddleStreamers } from '../store/paddle-streamers/paddle-streamers.actions';
import { PaddleStreamersState } from '../store/paddle-streamers/paddle-streamers.state';
import { Tile } from '../core/tile.model';
import { Tiles } from '../store/tiles/tiles.actions';
import { TileAngle } from '../core/tile-angle.model';
import { TileComponent } from '../shared/tile-component.model';
import { TileDirectionEnum } from '../core/tile-direction.enum';
import { TileId } from '../core/tile-id.model';
import { TilesState } from '../store/tiles/tiles.state';

import { MAX_TILES_COUNT, TILE_SIZE } from '../core/settings';
import { TILE_ANGLE_OFFSET_MULTIPLIERS } from '../core/tile-angle-offset-multipliers';
import { TILES_ADVANCED } from '../core/tiles-advanced';
import { TILES_BASIC } from '../core/tiles-basic';

@Component({
  selector: 'app-river',
  templateUrl: './river.component.html',
  styleUrls: ['./river.component.scss']
})
export class RiverComponent implements AfterViewInit, OnDestroy {
  @Input() isAdvancedRules?: boolean;
  @Input() isMoreAdvancedTiles?: boolean;
  @Input() tileSize = TILE_SIZE;

  @Select(PaddleStreamersState.currentSpaceId) readonly currentSpaceId$!: Observable<string | undefined>;
  @Select(TilesState.tiles) readonly tiles$!: Observable<Array<TileComponent>>;
  @Select(TilesState.triggeredTilesCount) readonly triggeredTilesCount$!: Observable<number>;

  tiles: Array<TileComponent> = new Array<TileComponent>();

  private currentAngle: TileAngle = 0;
  private currentOffsetLeft = 0;
  private currentOffsetTop = 0;
  private readonly ngUnsubscribe = new Subject<void>();
  private tileIds: Array<TileId> = new Array<TileId>();

  constructor(private store: Store) {
    this.generateTileIds();

    this.triggeredTilesCount$
      .pipe(
        filter((triggeredTilesCount) => triggeredTilesCount > 1),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((triggeredTilesCount) => {
        this.addNewTile();

        if (triggeredTilesCount === (MAX_TILES_COUNT - 1)) {
          // TODO: this.addFinishTile()
        }
      })
    ;

    this.tiles$
      .pipe(
        map((tiles) => this.tiles = tiles),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe()
    ;
  }

  ngAfterViewInit(): void {
    const timeoutId = setTimeout(() => {
      this.addFirstTile();
      this.addPaddleStreamer();
      clearTimeout(timeoutId);
    }, 1000);
    // TODO: в будущем и пароходы и первый фрагмент будут появляться уже после выбора настроек,
    //  в отличие от стартового фрагмента, который будет отрисован изначально
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /*ngOnInit(): void {
    for (let i = 1; i < MAX_TILES_COUNT; i++) {
      this.addNewTile();
    }
  }*/

  private addFirstTile(): void {
    this.addNewTile(this.currentAngle);
  }

  private addNewTile(angle: TileAngle = this.getNewTileAngle()): void {
    const tileAngleOffset = this.getTileAngleOffset(angle);
    let tileLeft = this.currentOffsetLeft + tileAngleOffset.left;
    let tileTop = this.currentOffsetTop + tileAngleOffset.top;
    let tilesOffsetLeft = 0;
    let tilesOffsetTop = 0;

    if (tileLeft < 0) {
      tilesOffsetLeft = -tileAngleOffset.left;
      tileLeft = this.currentOffsetLeft;
    }

    if (tileTop < 0) {
      tilesOffsetTop = -tileAngleOffset.top;
      tileTop = this.currentOffsetTop;
    }

    const offsetTiles = this.getOffsetTiles(tilesOffsetLeft, tilesOffsetTop);
    const crossingTile = this.findCrossingTile(offsetTiles, tileLeft, tileTop);

    if (crossingTile) {
      console.log('Пересечение фрагментов, повтор', crossingTile);
      this.addNewTile();
      return;
    }

    const newTile: TileComponent = {
      angle,
      id: this.tileIds[0],
      left: tileLeft,
      top: tileTop
    };
    offsetTiles.push(newTile);
    this.store.dispatch(new Tiles.Set(offsetTiles));
    this.tileIds.shift();
    this.currentAngle = angle;
    this.currentOffsetLeft = tileLeft;
    this.currentOffsetTop = tileTop;
  }

  private addPaddleStreamer(): void {
    const paddleStreamer: PaddleStreamer = {
      coal: 6,
      color: PaddleStreamerColorEnum.Red,
      currentAngle: 0,
      currentSpaceId: 'A0|2',
      // forwardSpaceId: '',
      scanTrigger: 0,
      speed: 1
    };
    this.store.dispatch(new PaddleStreamers.Add(paddleStreamer));
    this.store.dispatch(new PaddleStreamers.SetCurrentColor(PaddleStreamerColorEnum.Red));
  }

  private findCrossingTile(offsetTiles: Array<TileComponent>, offsetLeft: number, offsetTop: number): TileComponent | undefined {
    return offsetTiles.find((tile) => (
      offsetLeft > tile.left && offsetLeft < (tile.left + this.tileSize) &&
      offsetTop > tile.top && offsetTop < (tile.top + this.tileSize)
    ));
  }

  private getNewTileAngle(): TileAngle {
    const direction:TileDirectionEnum = getRandomTileDirection();
    let angle: TileAngle = this.currentAngle;

    if (direction === TileDirectionEnum.Left) {
      if (angle === 0) {
        angle = 360;
      }

      angle -= 60;
    } else if (direction === TileDirectionEnum.Right) {
      if (angle === 360) {
        angle = 0;
      }

      angle += 60;
    }

    return angle as TileAngle;
  }

  private getOffsetTiles(offsetLeft: number, offsetTop: number): Array<TileComponent> {
    const offsetTiles: Array<TileComponent> = [];

    this.tiles.forEach((tile) => {
      const offsetTile = {...tile};
      offsetTile.top += offsetTop;
      offsetTile.left += offsetLeft;
      offsetTiles.push(offsetTile);
    });

    return offsetTiles;
  }

  private generateTileIds(): void {
    let tiles: Array<Tile> = TILES_BASIC.filter((tile) => tile.id !== 'A0');

    if (this.isAdvancedRules) {
      let basicIdsToReplace: Array<TileId> = ['A3-1', 'A3-2', 'A3-3'];

      if (this.isMoreAdvancedTiles) {
        const additionalBasicIdsToReplace: Array<TileId> = ['A2-1', 'A2-2', 'A2-3'];
        basicIdsToReplace = [...basicIdsToReplace, ...additionalBasicIdsToReplace];
        // todo: активировать перерасчёт пассажиров - см. правила
      }

      tiles = tiles.filter((tile) => !basicIdsToReplace.includes(tile.id));
      const tilesAdvanced = [...TILES_ADVANCED];
      shuffleArray(tilesAdvanced);
      tiles = [...tiles, ...tilesAdvanced];
    }

    shuffleArray(tiles);
    tiles = tiles.slice(0, MAX_TILES_COUNT);

    tiles.forEach((tile) => {
      this.tileIds.push(tile.id);
    });
  }

  private getTileAngleOffset(angle: TileAngle): Coordinates {
    const offsetMultiplier = TILE_ANGLE_OFFSET_MULTIPLIERS[angle];

    return {
      left: offsetMultiplier.left * this.tileSize,
      top: offsetMultiplier.top * this.tileSize
    };
  }
}
