import { Coal } from './coal.model';
import { PaddleSteamerColorEnum } from './paddle-steamer-color.enum';
import { Passengers } from './passengers.model';
import { Speed } from './speed.model';
import { TileAngle } from './tile-angle.model';

export interface PaddleSteamer {
  coal: Coal;
  color: PaddleSteamerColorEnum;
  currentAngle: TileAngle;
  currentSpaceId?: string;
  forwardSpaceId?: string;
  passengers?: Passengers;
  scanTrigger: number;
  speed: Speed;
}
