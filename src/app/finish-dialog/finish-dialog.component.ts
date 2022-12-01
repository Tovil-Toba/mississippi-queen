import { Component, OnDestroy } from '@angular/core';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { Select } from '@ngxs/store';

import { PaddleStreamersState } from '../store/paddle-streamers/paddle-streamers.state';

@Component({
  selector: 'app-finish-dialog',
  templateUrl: './finish-dialog.component.html',
  styleUrls: ['./finish-dialog.component.scss']
})
export class FinishDialogComponent implements OnDestroy {
  @Select(PaddleStreamersState.finishedColors) readonly finishedColors$!: Observable<string[]>;

  isVisible = true;
  place?: number;

  private readonly ngUnsubscribe = new Subject<void>();

  constructor() {
    this.finishedColors$
      .pipe(
        map((finishedColors) => {
          this.isVisible = !!finishedColors.length;
          this.place = finishedColors.length; // TODO: Учитывать в будущем пассажиров и тд

          return finishedColors;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe()
    ;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
