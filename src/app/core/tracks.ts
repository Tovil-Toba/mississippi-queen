import { TileDirectionEnum } from './tile-direction.enum';
import { Tracks } from './tracks.model';

// TODO: А надо ли это???
export const TRACKS: Tracks = {
  [TileDirectionEnum.Forward]: [
    [0, 5, 10, 15],
    [1, 6, 11, 16],
    [2, 7, 12, 17],
    [3, 8, 13, 18],
    [4, 9, 14, 19]
  ],
  [TileDirectionEnum.Left]: [
    [0],
    [1, 5],
    [4, 2, 3, 6, 10],
    [9, 8, 7, 11, 15],
    [14, 13, 12, 16],
    [19, 18, 17]
  ],
  [TileDirectionEnum.Right]: [
    [15, 16, 17],
    [10, 11, 12, 18],
    [5, 6, 7, 3, 19],
    [0, 1, 2, 8, 14],
    [3, 9],
    [4]
  ],
};
