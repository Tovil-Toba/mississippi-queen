import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { PaddleStreamer } from './paddle-streamer.model';
import { PaddleStreamers } from '../store/paddle-streamers/paddle-streamers.actions';
import { PaddleStreamerColorEnum } from '../shared/paddle-streamer-color.enum';
import { PaddleStreamersCount } from './paddle-streamers-count.model';
import { shuffleArray } from '../shared/utils';

import { START_SPACE_IDS } from './start-tile';

@Injectable({
  providedIn: 'root'
})
export class PaddleStreamersService {
  private addedPaddleStreamersCount = 0;

  constructor(private store: Store) { }

  initPaddleStreamers(count: PaddleStreamersCount): void {
    const shuffledPaddleStreamerColors: Array<PaddleStreamerColorEnum> = this.getShuffledPaddleStreamerColors(count);
    console.log('shuffledPaddleStreamerColors', shuffledPaddleStreamerColors);
    shuffledPaddleStreamerColors.forEach(( color) => {
      this.addPaddleStreamer(color);
    });
    this.store.dispatch(new PaddleStreamers.SetCurrentColor(shuffledPaddleStreamerColors[0]));
  }

  private addPaddleStreamer(color: PaddleStreamerColorEnum): void {
    const startSpaceId = START_SPACE_IDS[this.addedPaddleStreamersCount];
    const paddleStreamer: PaddleStreamer = {
      coal: 6,
      color,
      currentAngle: 0,
      currentSpaceId: startSpaceId,
      scanTrigger: 0,
      speed: 1
    };
    console.log('paddleStreamer', paddleStreamer);
    this.store.dispatch(new PaddleStreamers.Add(paddleStreamer));
    this.addedPaddleStreamersCount++;
  }

  private getShuffledPaddleStreamerColors(count: PaddleStreamersCount): Array<PaddleStreamerColorEnum> {
    const paddleStreamerColors: Array<PaddleStreamerColorEnum> = Object.values(PaddleStreamerColorEnum);
    shuffleArray(paddleStreamerColors);
    return paddleStreamerColors.slice(0, count);
  }
}
