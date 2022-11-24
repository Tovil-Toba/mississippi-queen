import { SpaceTypeBasicEnum } from './space-type-basic.enum';
import { TileBasic } from './tile-basic.model';

export const TILES_BASIC: Array<TileBasic> = [
  {
    id: 'A0',
    spaces: [
      {
        index: 0,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 1,
        type: SpaceTypeBasicEnum.StartDock,
      },
      {
        index: 2,
        type: SpaceTypeBasicEnum.StartDock,
      },
      {
        index: 3,
        type: SpaceTypeBasicEnum.StartDock,
      },
      {
        index: 4,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 5,
        type: SpaceTypeBasicEnum.StartDock,
      },
      {
        index: 9,
        type: SpaceTypeBasicEnum.StartDock,
      },
    ]
  },
  {
    id: 'A1-1',
    spaces: [
      {
        index: 5,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 6,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 8,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 12,
        type: SpaceTypeBasicEnum.BlueDock,
        islandIndexes: [5, 6],
      },
    ]
  },
  {
    id: 'A1-2',
    spaces: [
      {
        index: 0,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 4,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 8,
        islandIndexes: [11, 12, 13],
        type: SpaceTypeBasicEnum.BlueDock,
      },
      {
        index: 11,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 12,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 13,
        type: SpaceTypeBasicEnum.Island,
      },
    ]
  },
  {
    id: 'A1-3',
    spaces: [
      {
        index: 4,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 7,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 10,
        type: SpaceTypeBasicEnum.BlueDock,
        islandIndexes: [7, 11, 12],
      },
      {
        index: 11,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 12,
        type: SpaceTypeBasicEnum.Island,
      },
    ]
  },
  {
    id: 'A1-4',
    spaces: [
      {
        index: 0,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 4,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 7,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 8,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 12,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 13,
        islandIndexes: [7, 8, 12],
        type: SpaceTypeBasicEnum.BlueDock,
      },
    ]
  },
  {
    id: 'A2-1',
    spaces: [
      {
        index: 0,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 4,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 7,
        islandIndexes: [11],
        type: SpaceTypeBasicEnum.RedDock,
      },
      {
        index: 8,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 11,
        type: SpaceTypeBasicEnum.Island,
      },
    ]
  },
  {
    id: 'A2-2',
    spaces: [
      {
        index: 0,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 8,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 12,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 14,
        islandIndexes: [8],
        type: SpaceTypeBasicEnum.RedDock,
      },
    ]
  },
  {
    id: 'A2-3',
    spaces: [
      {
        index: 0,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 4,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 7,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 8,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 11,
        islandIndexes: [7, 8],
        type: SpaceTypeBasicEnum.RedDock,
      },
    ]
  },
  {
    id: 'A2-4',
    spaces: [
      {
        index: 0,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 8,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 11,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 12,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 13,
        islandIndexes: [11, 12],
        type: SpaceTypeBasicEnum.RedDock,
      },
    ]
  },
  {
    id: 'A3-1',
    spaces: [
      {
        index: 4,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 5,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 7,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 9,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 10,
        type: SpaceTypeBasicEnum.Island,
      },
    ]
  },
  {
    id: 'A3-2',
    spaces: [
      {
        index: 1,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 2,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 3,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 13,
        type: SpaceTypeBasicEnum.Island,
      },
    ]
  },
  {
    id: 'A3-3',
    spaces: [
      {
        index: 4,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 6,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 8,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 11,
        type: SpaceTypeBasicEnum.Island,
      },
      {
        index: 18,
        type: SpaceTypeBasicEnum.Island,
      },
    ]
  },
];
