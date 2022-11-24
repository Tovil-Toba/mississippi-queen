import { SpaceIndex } from './space-index.model';
import { TileId } from './tile-id.model';

export const START_TILE_ID: TileId = 'A0';
export const START_SPACE_INDEXES: Array<SpaceIndex> = [2, 9, 5, 3, 1];

export const getStartSpaceIds = (): string[] => START_SPACE_INDEXES.map(
  (index) => START_TILE_ID + '|' + index
);
