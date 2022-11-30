import { SpaceIndex } from './space-index.model';
import { TileDirectionEnum } from './tile-direction.enum';

export const FINISH_SPACE_INDEXES: Record<TileDirectionEnum, Array<SpaceIndex>> = {
  [TileDirectionEnum.Left]: [10, 15, 16],
  [TileDirectionEnum.Forward]: [16, 17, 18],
  [TileDirectionEnum.Right]: [14, 18, 19],
};
