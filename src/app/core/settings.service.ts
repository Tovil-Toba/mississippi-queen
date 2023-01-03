import { Injectable } from '@angular/core';

import { MaxTilesCount } from './max-tiles-count.model';
import { PaddleStreamersCount } from './paddle-streamers-count.model';
import { TileSize } from './tile-size.model';

import { MAX_TILES_COUNT, PADDLE_STREAMERS_COUNT, TILE_SIZE } from './default-settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  maxTilesCount: MaxTilesCount = MAX_TILES_COUNT;
  paddleStreamersCount: PaddleStreamersCount = PADDLE_STREAMERS_COUNT;
  tileSize: TileSize = TILE_SIZE;
}
