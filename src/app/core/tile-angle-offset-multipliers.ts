import { TileAngleOffsets } from './tile-angle-offsets.model';

export const TILE_ANGLE_OFFSET_MULTIPLIERS: TileAngleOffsets = {
  0: { top: -0.796875, left: 0 },
  60: { top: -0.3984375, left: 0.6875 },
  120: { top: 0.3984375, left: 0.6875 },
  180: { top: 0.796875, left: 0 },
  240: { top: 0.3984375, left: -0.6875 },
  300: { top: -0.3984375, left: -0.6875 },
  360: { top: -0.796875, left: 0 }
};
