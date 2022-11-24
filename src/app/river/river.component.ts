import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
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

import { START_TILE_ID } from '../core/start-tile';
import { TILE_ANGLE_OFFSET_MULTIPLIERS } from '../core/tile-angle-offset-multipliers';
import { TILES_ADVANCED } from '../core/tiles-advanced';
import { TILES_BASIC } from '../core/tiles-basic';

@Component({
  selector: 'app-river',
  templateUrl: './river.component.html',
  styleUrls: ['./river.component.scss']
})
export class RiverComponent implements OnDestroy, OnInit {
  @Input() isAdvancedRules?: boolean;
  @Input() isMoreAdvancedTiles?: boolean;
  @Input() tileSize = 256;
  @Input() maxTilesCount = 12;

  @Select(PaddleStreamersState.currentSpaceId) currentSpaceId$!: Observable<string | undefined>;
  @Select(TilesState.tiles) tiles$!: Observable<Array<TileComponent>>;

  @Select(TilesState.newTileTrigger) private newTileTrigger$!: Observable<number>;

  tiles: Array<TileComponent> = new Array<TileComponent>();

  private currentAngle: TileAngle = 0;
  private currentOffsetLeft = 0;
  private currentOffsetTop = 0;
  private ngUnsubscribe = new Subject<void>();
  private tileIds: Array<TileId> = new Array<TileId>();

  constructor(private store: Store) {
    this.addStartTile();
    this.generateTileIds();
    this.addPaddleStreamer();

    this.newTileTrigger$
      .pipe(
        filter((newTileTrigger) => newTileTrigger > 0),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((newTileTrigger) => {
        this.addNewTile();
      });

    this.tiles$
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((tiles) => {
        this.tiles = tiles;
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit(): void {
    for (let i = 1; i < this.maxTilesCount; i++) {
      //this.addNewTile();
    }
  }

  private addNewTile(): void {
    const angle: TileAngle = this.getNewTileAngle();
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
      color: PaddleStreamerColorEnum.Red,
      currentAngle: 0,
      currentSpaceId: 'A0|2',
      // forwardSpaceId: '',
      scanTrigger: 0
    };
    this.store.dispatch(new PaddleStreamers.Add(paddleStreamer));
    this.store.dispatch(new PaddleStreamers.SetCurrentColor(PaddleStreamerColorEnum.Red));
  }

  private addStartTile(): void {
    const startTile: TileComponent = {
      id: START_TILE_ID,
      angle: this.currentAngle,
      left: this.currentOffsetLeft,
      top: this.currentOffsetTop
    };
    this.store.dispatch(new Tiles.Add(startTile));
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

    this.tiles.forEach((tile, index) => {
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
    tiles = tiles.slice(0, this.maxTilesCount);

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
