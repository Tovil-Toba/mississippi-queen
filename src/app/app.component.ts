import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PrimeNGConfig } from 'primeng/api';
import { Select, Store } from '@ngxs/store';

import { MaxTilesCount } from './core/max-tiles-count.model';
import { PaddleSteamers } from './store/paddle-steamers/paddle-steamers.actions';
import { PaddleSteamersCount } from './core/paddle-steamers-count.model';
import { SettingsService } from './core/settings.service';
import { SpaceIndex } from './core/space-index.model';
import { SpaceTypeAdvancedEnum } from './core/space-type-advanced.enum';
import { SpaceTypeBasicEnum } from './core/space-type-basic.enum';
import { TileId } from './core/tile-id.model';
import { TileSize } from './core/tile-size.model';
import { TilesState } from './store/tiles/tiles.state';

import { TILES } from './core/tiles';
import { TILES_ADVANCED } from './core/tiles-advanced';
import { TILES_BASIC } from './core/tiles-basic';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @Select(TilesState.tilesCount) readonly tilesCount$!: Observable<number>;

  readonly title = 'Королева Миссисипи';

  isWheelSpinEnabled = false;

  constructor(
    private primengConfig: PrimeNGConfig,
    private settings: SettingsService,
    private store: Store
  ) { }

  get maxTilesCount(): MaxTilesCount {
    return this.settings.maxTilesCount;
  }

  get paddleSteamersCount(): PaddleSteamersCount {
    return this.settings.paddleSteamersCount;
  }

  get tileSize(): TileSize {
    return this.settings.tileSize;
  }

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.info();
  }

  onScroll(): void {
    this.store.dispatch(new PaddleSteamers.TriggerScan());
  }

  private info(): void {
    console.log('Все фрагменты:', TILES);
    console.log('Базовые фрагменты:', TILES_BASIC);
    console.log('Продвинутые фрагменты:', TILES_ADVANCED);

    const allIslandsArray: Array<SpaceIndex> = new Array<SpaceIndex>();
    const allIslandsMap: Map<TileId, Array<SpaceIndex>> = new Map<TileId, Array<SpaceIndex>>();
    const allCoalDocksMap: Map<TileId, Array<SpaceIndex>> = new Map<TileId, Array<SpaceIndex>>();

    TILES.forEach((tile) => {
      tile.spaces.forEach((space) => {
        if (space.type === SpaceTypeBasicEnum.Island) {
          allIslandsArray.push(space.index);

          if (!allIslandsMap.get(tile.id)) {
            allIslandsMap.set(tile.id, new Array<SpaceIndex>());
          }

          allIslandsMap.get(tile.id)?.push(space.index);
        } else if (space.type === SpaceTypeAdvancedEnum.CoalDock) {
          if (!allCoalDocksMap.get(tile.id)) {
            allCoalDocksMap.set(tile.id, new Array<SpaceIndex>());
          }

          allCoalDocksMap.get(tile.id)?.push(space.index);
        }
      });
    });

    console.log('Все острова Array: ', allIslandsArray);
    console.log('Все острова Map: ', allIslandsMap);
    console.log('Все пристани угля Map: ', allCoalDocksMap);
  }
}
