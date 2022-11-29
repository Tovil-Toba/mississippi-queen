import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';

import { Coordinates } from '../core/coordinates.model';
import { PaddleStreamers } from '../store/paddle-streamers/paddle-streamers.actions';
import { SpaceComponent } from '../shared/space-component.model';
import { SpaceIndex } from '../core/space-index.model';
import { TileAngle } from '../core/tile-angle.model';
import { TileId } from '../core/tile-id.model';

import { SPACE_CENTER_MULTIPLIERS } from '../core/space-center-multipliers';
import { TILE_SIZE } from '../core/settings';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements AfterViewInit, OnInit {
  @Input() angle: TileAngle = 0;
  @Input() currentSpaceId?: string | null;
  @Input() id!: TileId;
  @Input() index!: number;
  @Input() left?: number = 0;
  @Input() size?: number = TILE_SIZE;
  @Input() top?: number = 0;

  spaces: Array<SpaceComponent> = new Array<SpaceComponent>();
  zIndex = 0;

  constructor(private store: Store) { }

  ngAfterViewInit(): void {
    this.store.dispatch(new PaddleStreamers.TriggerScan());
  }

  ngOnInit(): void {
    this.initSpaces();
  }

  onMouseEnter(): void {
    this.zIndex = 1;
  }

  onMouseLeave(): void {
    this.zIndex = 0;
  }

  private initSpaces(): void {
    for (const spaceIndex in SPACE_CENTER_MULTIPLIERS) {
      const index = spaceIndex as unknown as SpaceIndex;
      const multipliers: Coordinates = SPACE_CENTER_MULTIPLIERS[index];
      const id = `${this.id}|${index}`;
      const space: SpaceComponent = {
        id,
        index,
        centerLeft: multipliers.left * (this.size as number),
        centerTop: multipliers.top * (this.size as number)
      };
      this.spaces.push(space);
    }
  }
}
