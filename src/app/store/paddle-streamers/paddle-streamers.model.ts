import { PaddleStreamer } from '../../core/paddle-streamer.model';
import { PaddleStreamerColorEnum } from '../../shared/paddle-streamer-color.enum';
import { Speed } from '../../core/speed.model';
import { TileAngle } from '../../core/tile-angle.model';

export class PaddleStreamersStateModel {
  currentColor?: PaddleStreamerColorEnum;
  finishedColors!: Array<PaddleStreamerColorEnum>;
  history!: Array<TileAngle | string>;
  isFreeSpeedChangeUsed?: boolean;
  initialSpeed?: Speed;
  order!: Array<PaddleStreamerColorEnum>;
  paddleStreamers!: {[color in PaddleStreamerColorEnum]?: PaddleStreamer };
}
