import { PaddleSteamerColorEnum } from './paddle-steamer-color.enum';

export const PADDLE_STEAMER_COLORS: Array<PaddleSteamerColorEnum> = Object.values(PaddleSteamerColorEnum);

export const PADDLE_STEAMER_COLORS_WITHOUT_BLACK_ROSE =
  PADDLE_STEAMER_COLORS.filter((color) => color !== PaddleSteamerColorEnum.Black)
;
