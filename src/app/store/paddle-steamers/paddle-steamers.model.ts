import { PaddleSteamer } from '../../core/paddle-steamer.model';
import { PaddleSteamerColorEnum } from '../../shared/paddle-steamer-color.enum';
import { Speed } from '../../core/speed.model';
import { TileAngle } from '../../core/tile-angle.model';

export class PaddleSteamersStateModel {
  currentColor?: PaddleSteamerColorEnum;
  finishedColors!: Array<PaddleSteamerColorEnum>;
  history!: Array<TileAngle | string>;
  isFreeSpeedChangeUsed?: boolean;
  initialSpeed?: Speed;
  order!: Array<PaddleSteamerColorEnum>;
  paddleSteamers!: {[color in PaddleSteamerColorEnum]?: PaddleSteamer };
}
