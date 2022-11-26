import { SpaceIndex } from '../core/space-index.model';
import { TileDirectionEnum } from '../core/tile-direction.enum';
import { TileId } from '../core/tile-id.model';

export const getIndexOfSpaceId = (spaceId: string): SpaceIndex | undefined => {
  return spaceId?.split('|')?.[1] as unknown as SpaceIndex;
};

export const getRandomTileDirection = (): TileDirectionEnum => {
  const directions: Array<TileDirectionEnum> = [
    TileDirectionEnum.Forward,
    TileDirectionEnum.Left,
    TileDirectionEnum.Right
  ];
  const randomIndex = randomIntFromInterval(0, directions.length - 1);

  return directions[randomIndex];
};

export const getTileIdBySpaceId = (spaceId: string): TileId | undefined => {
  return spaceId?.split('|')?.[0] as TileId;
};

export const isArrayOfStrings = (value: unknown): boolean => {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
};

export const isNonEmptyArrayOfStrings = (value: unknown): boolean => {
  return Array.isArray(value) && value.length > 0 && value.every(item => typeof item === 'string');
};

export const randomIntFromInterval = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const shuffleArray = (array: Array<unknown>): void => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};
