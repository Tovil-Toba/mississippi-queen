import { Injectable } from '@angular/core';

import { SpaceTypeBasicEnum } from '../core/space-type-basic.enum';
import { SpaceTypeAdvancedEnum } from '../core/space-type-advanced.enum';

import { TILES } from '../core/tiles';

@Injectable({
  providedIn: 'root'
})
export class SpacesService {
  getSpaceType(spaceId: string): SpaceTypeBasicEnum | SpaceTypeAdvancedEnum | undefined {
    const [tileId, spaceIndex] = spaceId.split('|');
    const tile = TILES.find((tile) => tile.id === tileId);

    if (tile) {
      return tile.spaces.find((space) => space.index === +spaceIndex)?.type ?? SpaceTypeBasicEnum.Water;
    }

    return;
  }
}
