import { SpaceIndex } from './space-index.model';
import { TileComponent } from '../shared/tile-component.model';
import { TileId } from './tile-id.model';

export const START_TILE_ID: TileId = 'A0';

export const START_SPACE_INDEXES: Array<SpaceIndex> = [2, 9, 5, 3, 1];

export const START_TILE: TileComponent = {
  id: START_TILE_ID,
  angle: 0,
  left: 0,
  top: 0
};

export const getStartSpaceIds = (): string[] => START_SPACE_INDEXES.map(
  (index) => `${START_TILE_ID}|${index}`
);
