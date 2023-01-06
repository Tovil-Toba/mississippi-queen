import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { PaddleSteamer } from './paddle-steamer.model';
import { PaddleSteamers } from '../store/paddle-steamers/paddle-steamers.actions';
import { PaddleSteamerColorEnum } from '../shared/paddle-steamer-color.enum';
import { PaddleSteamersCount } from './paddle-steamers-count.model';
import { shuffleArray } from '../shared/utils';

import { PADDLE_STEAMER_COLORS_WITHOUT_BLACK_ROSE } from '../shared/paddle-steamer-colors';
import { START_SPACE_IDS } from './start-tile';

@Injectable({
  providedIn: 'root'
})
export class PaddleSteamersService {
  private addedPaddleSteamersCount = 0;

  constructor(private store: Store) { }

  initPaddleSteamers(count: PaddleSteamersCount): void {
    const shuffledPaddleSteamerColors: Array<PaddleSteamerColorEnum> = this.getShuffledPaddleSteamerColors(count);
    // console.log('shuffledPaddleSteamerColors', shuffledPaddleSteamerColors);
    shuffledPaddleSteamerColors.forEach(( color) => {
      this.addPaddleSteamer(color);
    });
    this.store.dispatch(new PaddleSteamers.SetCurrentColor(shuffledPaddleSteamerColors[0]));
  }

  private addPaddleSteamer(color: PaddleSteamerColorEnum): void {
    const startSpaceId = START_SPACE_IDS[this.addedPaddleSteamersCount];
    const paddleSteamer: PaddleSteamer = {
      coal: 6,
      color,
      currentAngle: 0,
      currentSpaceId: startSpaceId,
      scanTrigger: 0,
      speed: 1
    };
    // console.log('paddleSteamer', paddleSteamer);
    this.store.dispatch(new PaddleSteamers.Add(paddleSteamer));
    this.addedPaddleSteamersCount++;
  }

  private getShuffledPaddleSteamerColors(count: PaddleSteamersCount): Array<PaddleSteamerColorEnum> {
    const paddleSteamerColors: Array<PaddleSteamerColorEnum> = [...PADDLE_STEAMER_COLORS_WITHOUT_BLACK_ROSE];
    shuffleArray(paddleSteamerColors);
    return paddleSteamerColors.slice(0, count);
  }
}
