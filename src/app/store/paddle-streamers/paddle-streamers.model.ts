import { PaddleStreamerColorEnum } from '../../shared/paddle-streamer-color.enum';
import { TileAngle } from '../../core/tile-angle.model';

export interface PaddleStreamer {
  coal: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  color: PaddleStreamerColorEnum;
  currentAngle: TileAngle;
  currentSpaceId?: string;
  forwardSpaceId?: string;
  passengers?: number;
  scanTrigger: number;
  speed: 1 | 2 | 3 | 4 | 5 | 6;
}

export class PaddleStreamersStateModel {
  public currentColor?: PaddleStreamerColorEnum;
  public history!: Array<TileAngle | string>;
  public order!: Array<any>; // todo: реализовать
  public paddleStreamers!: {[color in PaddleStreamerColorEnum]?: PaddleStreamer };
}
