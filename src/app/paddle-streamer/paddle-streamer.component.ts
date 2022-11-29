import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { map, Observable, Subject, takeUntil} from 'rxjs';
import { Select, Store } from '@ngxs/store';

import { PaddleStreamerColorEnum } from '../shared/paddle-streamer-color.enum';
import { PaddleStreamers } from '../store/paddle-streamers/paddle-streamers.actions';
import { PaddleStreamersState } from '../store/paddle-streamers/paddle-streamers.state';
import { TileAngle } from '../core/tile-angle.model';
import { TileAngleOffsets } from '../core/tile-angle-offsets.model';
import { TileComponent } from '../shared/tile-component.model';
import { TilesState } from '../store/tiles/tiles.state';

import { TILE_SIZE } from '../core/settings';

@Component({
  selector: 'app-paddle-streamer',
  templateUrl: './paddle-streamer.component.html',
  styleUrls: ['./paddle-streamer.component.scss']
})
export class PaddleStreamerComponent implements AfterViewInit, OnDestroy, OnInit {
  @Input() color?: PaddleStreamerColorEnum = PaddleStreamerColorEnum.Red; // todo: убрать по умолчанию
  @Input() spaceId!: string;
  @Input() tileAngle!: TileAngle;
  @Input() tileSize?: number = TILE_SIZE;

  @ViewChild('img') imgRef?: ElementRef;

  @Select(PaddleStreamersState.currentAngle) private readonly currentAngle$!: Observable<TileAngle>;
  @Select(PaddleStreamersState.scanTrigger) private readonly scanTrigger$!: Observable<number>;

  angle: TileAngle = 0;
  centerLeft = 0;
  centerTop = 0;

  tile?: TileComponent;

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

  constructor(private store: Store) {
    this.currentAngle$
      .pipe(
        map((currentAngle) => this.currentAngle = currentAngle),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe()
    ;

    this.scanTrigger$
      .pipe(
        // filter((scanTrigger) => scanTrigger > 0),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(() => {
        this.scan();
      });
  }

  get boatAngle(): number {
    return this.currentAngle - this.tileAngle;
  }

  get size(): number {
    return 0.1375 * (this.tileSize as number);
  }

  ngAfterViewInit(): void {
    this.store.dispatch(new PaddleStreamers.TriggerScan());
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
  }

  private scan(): void {
    if (!this.tile) {
      // console.error('Фрагмент реки не найден');
      return;
    }

    const img = this.imgRef?.nativeElement as HTMLElement | undefined;
    const rect = img?.getBoundingClientRect();

    if (!rect) {
      console.error('Картинка парохода не найдена');
      return;
    }

    const elements = document.elementsFromPoint(
      rect.left + rect.width/2 + this.angleOffsetMultipliers[this.currentAngle].left*this.size,
      rect.top + rect.height/2 + this.angleOffsetMultipliers[this.currentAngle].top*this.size
    );

    this.store.dispatch(new PaddleStreamers.SetForwardSpaceId(undefined));

    elements.forEach((element) => {
      if (element.id.includes('|') && element.id !== this.spaceId) {
        this.store.dispatch(new PaddleStreamers.SetForwardSpaceId(element.id));
      }
    });
  }
}
