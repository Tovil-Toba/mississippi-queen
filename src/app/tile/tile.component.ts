import { AfterViewInit, Component, Input, OnInit } from '@angular/core';

import { Coordinates } from '../core/coordinates.model';
import { SpaceComponent } from '../shared/space-component.model';
import { SpaceIndex } from '../core/space-index.model';
import { TileAngle } from '../core/tile-angle.model';
import { TileId } from '../core/tile-id.model';

import { SPACE_CENTER_MULTIPLIERS } from '../core/space-center-multipliers';

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
  @Input() size?: number = 256;
  @Input() top?: number = 0;

  isLoaded = false;
  spaces: Array<SpaceComponent> = new Array<SpaceComponent>();
  zIndex = 0;

  ngAfterViewInit(): void {
    this.isLoaded = true;
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
