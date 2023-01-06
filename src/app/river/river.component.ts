import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { filter, map, Observable, Subject, takeUntil } from 'rxjs';
import { Select, Store } from '@ngxs/store';

import { Coordinates } from '../core/coordinates.model';
import { getRandomTileDirection, shuffleArray } from '../shared/utils';
import { PaddleSteamersCount } from '../core/paddle-steamers-count.model';
import { PaddleSteamersService } from '../core/paddle-steamers.service';
import { SettingsService } from '../core/settings.service';
import { Tile } from '../core/tile.model';
import { Tiles } from '../store/tiles/tiles.actions';
import { TileAngle } from '../core/tile-angle.model';
import { TileComponent } from '../shared/tile-component.model';
import { TileDirectionEnum } from '../core/tile-direction.enum';
import { TileId } from '../core/tile-id.model';
import { TileSize } from '../core/tile-size.model';
import { TilesState } from '../store/tiles/tiles.state';

import { FINISH_SPACE_INDEXES } from '../core/finish-space-indexes';
import { PADDLE_STEAMERS_COUNT, TILE_SIZE } from '../core/default-settings';
import { START_TILE_ANGLE, START_TILE_ID } from '../core/start-tile';
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
  @Input() paddleSteamersCount: PaddleSteamersCount = PADDLE_STEAMERS_COUNT;
  @Input() tileSize: TileSize = TILE_SIZE;

  @Select(TilesState.tiles) readonly tiles$!: Observable<Array<TileComponent>>;
  @Select(TilesState.triggeredTilesCount) readonly triggeredTilesCount$!: Observable<number>;

  tiles: Array<TileComponent> = [];

  private currentAngle: TileAngle = START_TILE_ANGLE;
  private currentDirection: TileDirectionEnum = TileDirectionEnum.Forward;
  private currentOffsetLeft = 0;
  private currentOffsetTop = 0;
  private currentTileId: TileId = START_TILE_ID;
  private readonly ngUnsubscribe = new Subject<void>();
  private readonly twoLastAddedTileDirections: Array<TileDirectionEnum | undefined> = [undefined, undefined];
  private tileIds: Array<TileId> = [];

  constructor(
    private paddleSteamersService: PaddleSteamersService,
    private settings: SettingsService,
    private store: Store
  ) {
    this.generateTileIds();

    this.triggeredTilesCount$
      .pipe(
        filter((triggeredTilesCount) => triggeredTilesCount > 1),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((triggeredTilesCount) => {
        this.addNewTile();

        if (triggeredTilesCount === (this.settings.maxTilesCount - 1)) {
          const timeoutId = setTimeout(() => {
          this.addFinishTile();
            clearTimeout(timeoutId);
          }, 1000);
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
      this.paddleSteamersService.initPaddleSteamers(this.paddleSteamersCount);
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
    for (let i = 1; i < this.settings.maxTilesCount; i++) {
      this.addNewTile();
    }
  }*/

  private addFirstTile(): void {
    this.addNewTile(this.currentAngle);
  }

  private addFinishTile(): void {
    const lastTileId = this.currentTileId; // Обязательно до this.addNewTile(), т.к. this.currentTileId переопределится
    this.addNewTile(); // Повторный вызов, т.к. последний фрагмент в массиве this.tileIds - финишный
    const finishSpaceIds = this.getFinishSpaceIds(lastTileId);
    this.store.dispatch(new Tiles.SetFinishSpaceIds(finishSpaceIds));
  }

  private getFinishSpaceIds(lastTileId: TileId): string[] {
    const finishSpaceIndexes = FINISH_SPACE_INDEXES[this.currentDirection];
    return finishSpaceIndexes.map((spaceIndex) => `${lastTileId}|${spaceIndex}`);
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
    this.currentTileId = this.tileIds[0];
    const newTile: TileComponent = {
      angle,
      id: this.currentTileId,
      left: tileLeft,
      top: tileTop
    };
    const crossingTile = this.findCrossingTile(offsetTiles, newTile);

    if (crossingTile) {
      console.log('Пересечение фрагментов, повтор', crossingTile);
      console.log('Новый фрагмент', newTile);
      this.addNewTile();
      return;
    }

    offsetTiles.push(newTile);
    this.store.dispatch(new Tiles.Set(offsetTiles));
    this.tileIds.shift();
    this.storeAddedTileDirection();
    this.currentAngle = angle;
    this.currentOffsetLeft = tileLeft;
    this.currentOffsetTop = tileTop;
  }

  private findCrossingTile(offsetTiles: Array<TileComponent>, newTile: TileComponent): TileComponent | undefined {
    return offsetTiles.find((tile) => {
      const newTileRight = newTile.left + this.tileSize * Math.abs(TILE_ANGLE_OFFSET_MULTIPLIERS[newTile.angle].left);
      const newTileBottom = newTile.top + this.tileSize * Math.abs(TILE_ANGLE_OFFSET_MULTIPLIERS[newTile.angle].top);
      const tileRight = tile.left  + this.tileSize * Math.abs(TILE_ANGLE_OFFSET_MULTIPLIERS[tile.angle].left);
      const tileBottom = tile.top + this.tileSize * Math.abs(TILE_ANGLE_OFFSET_MULTIPLIERS[tile.angle].top);

      return (
        newTile.left >= tile.left && newTile.left <= tileRight ||
        newTileRight >= tile.left && newTileRight <= tileRight
      ) && (
        newTile.top > tile.top && newTile.top < tileBottom ||
        newTileBottom > tile.top && newTileBottom < tileBottom
      );
    });
  }

  private isThreeSameRotationsInARow(tileDirection: TileDirectionEnum) : boolean {
    return !!(
      tileDirection !== TileDirectionEnum.Forward &&
      this.twoLastAddedTileDirections[0] &&
      this.twoLastAddedTileDirections[1] &&
      this.twoLastAddedTileDirections[0] === this.twoLastAddedTileDirections[1] &&
      this.twoLastAddedTileDirections[1] === tileDirection
    );
  }

  private getNewTileAngle(): TileAngle {
    const randomDirection = getRandomTileDirection();

    if (this.isThreeSameRotationsInARow(randomDirection)) {
      this.getNewTileAngle();
    }

    this.currentDirection = randomDirection;
    let angle: TileAngle = this.currentAngle;

    if (this.currentDirection === TileDirectionEnum.Left) {
      if (angle === 0) {
        angle = 360;
      }

      angle -= 60;
    } else if (this.currentDirection === TileDirectionEnum.Right) {
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
    let tiles: Array<Tile> = TILES_BASIC.filter((tile) => tile.id !== 'A0' && tile.id !== 'Finish');

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
    tiles = tiles.slice(0, this.settings.maxTilesCount);

    tiles.forEach((tile) => {
      this.tileIds.push(tile.id);
    });

    this.tileIds.push('Finish');
  }

  private getTileAngleOffset(angle: TileAngle): Coordinates {
    const offsetMultiplier = TILE_ANGLE_OFFSET_MULTIPLIERS[angle];

    return {
      left: offsetMultiplier.left * this.tileSize,
      top: offsetMultiplier.top * this.tileSize
    };
  }

  private storeAddedTileDirection(): void {
    this.twoLastAddedTileDirections[1] = this.twoLastAddedTileDirections[0];
    this.twoLastAddedTileDirections[0] = this.currentDirection;
  }
}
