import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { distinctUntilChanged, map, Observable, Subject, takeUntil } from 'rxjs';
import { Select, Store } from '@ngxs/store';

import { PaddleSteamerColorEnum } from '../shared/paddle-steamer-color.enum';
import { PaddleSteamers } from '../store/paddle-steamers/paddle-steamers.actions';
import { PaddleSteamersState } from '../store/paddle-steamers/paddle-steamers.state';
import { SpacesService } from '../shared/spaces.service';
import { SpaceTypeAdvancedEnum } from '../core/space-type-advanced.enum';
import { SpaceTypeBasicEnum } from '../core/space-type-basic.enum';
import { TileAngle } from '../core/tile-angle.model';
import { TileAngleOffsets } from '../core/tile-angle-offsets.model';
import { TileComponent } from '../shared/tile-component.model';
import { TileSize } from '../core/tile-size.model';
import { TilesState } from '../store/tiles/tiles.state';

import { TILE_SIZE } from '../core/default-settings';

@Component({
  selector: 'app-paddle-steamer',
  templateUrl: './paddle-steamer.component.html',
  styleUrls: ['./paddle-steamer.component.scss']
})
export class PaddleSteamerComponent implements AfterViewInit, OnDestroy, OnInit {
  @Input() color!: PaddleSteamerColorEnum;
  @Input() spaceId!: string;
  @Input() tileAngle!: TileAngle;
  @Input() tileSize?: TileSize = TILE_SIZE;

  @ViewChild('img') imgRef?: ElementRef;

  @Select(PaddleSteamersState.currentColor) private readonly currentColor$!: Observable<PaddleSteamerColorEnum | undefined>;

  centerLeft = 0;
  centerTop = 0;

  private tile?: TileComponent;

  private readonly angleOffsetMultipliers: TileAngleOffsets = {
    0: { left: 0, top: -1.75 },
    60: { left: 3/2, top: -1/2 },
    120: { left: 3/2, top: 1 },
    180: { left: 0, top: 1.75 },
    240: { left: -1, top: 1 },
    300: { left: -1, top: -1/2 },
    360: { left: 0, top: -1.75 }
  };
  private currentAngle: TileAngle = 0;
  private ngUnsubscribe = new Subject<void>();

  constructor(private spacesService: SpacesService, private store: Store) { }

  get boatAngle(): number {
    return this.currentAngle - this.tileAngle;
  }

  get size(): number {
    return 0.1375 * (this.tileSize as number);
  }

  ngAfterViewInit(): void {
    this.store.dispatch(new PaddleSteamers.TriggerScan());
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit(): void {
    this.store
      .selectOnce(TilesState.tile)
      .pipe(map((filterFn) => this.tile = filterFn(this.spaceId)))
      .subscribe()
    ;

    this.store
      .select(PaddleSteamersState.currentAngle)
      .pipe(
        map((filterFn) => this.currentAngle = filterFn(this.color)),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe()
    ;

    this.store
      .select(PaddleSteamersState.scanTrigger)
      .pipe(
        map(filterFn => filterFn(this.color)),
        distinctUntilChanged(),
        takeUntil(this.ngUnsubscribe)
      ).subscribe(() => {
        this.scan();
      })
    ;
  }

  private scan(): void {
    if (!this.tile) {
      // console.error('Фрагмент реки не найден');
      return;
    }

    const img = this.imgRef?.nativeElement as HTMLElement | undefined;
    const rect = img?.getBoundingClientRect();

    if (!rect) {
      // console.error('Картинка парохода не найдена');
      return;
    }

    const elements = document.elementsFromPoint(
      rect.left + rect.width/2 + this.angleOffsetMultipliers[this.currentAngle].left*this.size,
      rect.top + rect.height/2 + this.angleOffsetMultipliers[this.currentAngle].top*this.size
    );

    this.store.dispatch(new PaddleSteamers.SetForwardSpaceId(undefined));

    elements.forEach((element) => {
      const spaceId = element.id.includes('|') && element.id;
      if (!spaceId) {
        return;
      }

      const spaceType: SpaceTypeBasicEnum | SpaceTypeAdvancedEnum | undefined = this.spacesService.getSpaceType(spaceId);
      if (!spaceType && spaceId === this.spaceId) {
        return;
      }

      /*const currentSpaceType = this.spacesService.getSpaceType(this.spaceId);
      console.log('Current space type:', currentSpaceType);
      console.log('Forward space type:', spaceType);*/

      if (spaceType !== SpaceTypeBasicEnum.Island && spaceType !== SpaceTypeAdvancedEnum.Island) {
        this.store.dispatch(new PaddleSteamers.SetForwardSpaceId(spaceId));
      }
    });
  }
}
