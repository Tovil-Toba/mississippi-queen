import { Coal } from '../../core/coal.model';
import { PaddleStreamerColorEnum } from '../../shared/paddle-streamer-color.enum';
import { Speed } from '../../core/speed.model';
import { TileAngle } from '../../core/tile-angle.model';

export interface PaddleStreamer {
  coal: Coal;
  color: PaddleStreamerColorEnum;
  currentAngle: TileAngle;
  currentSpaceId?: string;
  forwardSpaceId?: string;
  passengers?: number;
  scanTrigger: number;
  speed: Speed;
}

export class PaddleStreamersStateModel {
  currentColor?: PaddleStreamerColorEnum;
  finishedColors!: Array<PaddleStreamerColorEnum>;
  history!: Array<TileAngle | string>;
  isFreeSpeedChangeUsed?: boolean;
  initialSpeed?: Speed;
  order!: Array<any>; // todo: реализовать
  paddleStreamers!: {[color in PaddleStreamerColorEnum]?: PaddleStreamer };
}
