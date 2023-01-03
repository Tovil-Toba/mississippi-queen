import { Coal } from './coal.model';
import { PaddleStreamerColorEnum } from '../shared/paddle-streamer-color.enum';
import { Passengers } from './passengers.model';
import { Speed } from './speed.model';
import { TileAngle } from './tile-angle.model';

export interface PaddleStreamer {
  coal: Coal;
  color: PaddleStreamerColorEnum;
  currentAngle: TileAngle;
  currentSpaceId?: string;
  forwardSpaceId?: string;
  passengers?: Passengers;
  scanTrigger: number;
  speed: Speed;
}
