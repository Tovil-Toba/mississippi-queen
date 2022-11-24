import { Action, State, Selector, StateContext, StateToken } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PaddleStreamer, PaddleStreamersStateModel } from './paddle-streamers.model';
import { PaddleStreamers } from './paddle-streamers.actions';
import { PaddleStreamerColorEnum } from '../../shared/paddle-streamer-color.enum';
import { TileAngle } from '../../core/tile-angle.model';

const PADDLE_STREAMERS_TOKEN: StateToken<PaddleStreamersStateModel> = new StateToken('paddleStreamers');

const defaults = {
  currentPaddleStreamer: undefined,
  order: [],
  paddleStreamers: {},
};

@State<PaddleStreamersStateModel>({
  name: PADDLE_STREAMERS_TOKEN,
  defaults
})
@Injectable()
export class PaddleStreamersState {
  @Selector()
  static currentPaddleStreamer(state: PaddleStreamersStateModel): (PaddleStreamer | undefined) {
    return state.currentColor ? state.paddleStreamers[state.currentColor] : undefined;
  }

  @Selector()
  static currentAngle(state: PaddleStreamersStateModel): TileAngle {
    return state.currentColor ? state.paddleStreamers[state.currentColor]?.currentAngle ?? 0 : 0;
  }

  @Selector()
  static currentSpaceId(state: PaddleStreamersStateModel): (string | undefined) {
    return state.currentColor ? state.paddleStreamers[state.currentColor]?.currentSpaceId : undefined;
  }

  @Selector()
  static forwardSpaceId(state: PaddleStreamersStateModel): (string | undefined) {
    return state.currentColor ? state.paddleStreamers[state.currentColor]?.forwardSpaceId : undefined;
  }

  @Selector()
  static paddleStreamer(state: PaddleStreamersStateModel): (colorOrSpaceId: PaddleStreamerColorEnum | string) => (PaddleStreamer | undefined) {
    return (colorOrSpaceId: PaddleStreamerColorEnum | string): (PaddleStreamer | undefined) => {
      return Object.values((state.paddleStreamers))
        .find((paddleStreamer) => paddleStreamer.color === colorOrSpaceId || paddleStreamer.currentSpaceId === colorOrSpaceId);
    };
  }

  @Selector()
  static scanTrigger(state: PaddleStreamersStateModel): number {
    return state.currentColor ? state.paddleStreamers[state.currentColor]?.scanTrigger ?? 0 : 0;
  }

  @Action(PaddleStreamers.Add)
  add({ getState, patchState }: StateContext<PaddleStreamersStateModel>, { payload }: PaddleStreamers.Add): void {
    const state = getState();
    const paddleStreamers = {...state.paddleStreamers};
    paddleStreamers[payload.color] = payload;
    patchState({
      paddleStreamers
    });
  }

  @Action(PaddleStreamers.MoveForward)
  moveForward({ dispatch, getState, patchState }: StateContext<PaddleStreamersStateModel>): Observable<void> {
    const state = getState();

    if (state.currentColor) {
      const paddleStreamers = {...state.paddleStreamers};
      const paddleStreamer = {...paddleStreamers[state.currentColor]} as PaddleStreamer;
      paddleStreamer.currentSpaceId = paddleStreamer.forwardSpaceId;
      paddleStreamers[paddleStreamer.color] = paddleStreamer;
      patchState({ paddleStreamers });
    }

    return dispatch(new PaddleStreamers.TriggerScan());
  }

  @Action(PaddleStreamers.RotateLeft)
  rotateLeft({ dispatch, getState, patchState }: StateContext<PaddleStreamersStateModel>): Observable<void> {
    const state = getState();

    if (state.currentColor) {
      const paddleStreamers = {...state.paddleStreamers};
      const paddleStreamer = {...paddleStreamers[state.currentColor]} as PaddleStreamer;

      if (paddleStreamer.currentAngle === 0) {
        paddleStreamer.currentAngle = 360;
      }
      paddleStreamer.currentAngle -= 60;
      paddleStreamers[paddleStreamer.color] = paddleStreamer;
      patchState({ paddleStreamers });
    }

    return dispatch(new PaddleStreamers.TriggerScan());
  }

  @Action(PaddleStreamers.RotateRight)
  rotateRight({ dispatch, getState, patchState }: StateContext<PaddleStreamersStateModel>): Observable<void> {
    const state = getState();

    if (state.currentColor) {
      const paddleStreamers = {...state.paddleStreamers};
      const paddleStreamer = {...paddleStreamers[state.currentColor]} as PaddleStreamer;

      if (paddleStreamer.currentAngle === 360) {
        paddleStreamer.currentAngle = 0;
      }
      paddleStreamer.currentAngle += 60;
      paddleStreamers[paddleStreamer.color] = paddleStreamer;
      patchState({ paddleStreamers });
    }

    return dispatch(new PaddleStreamers.TriggerScan());
  }

  @Action(PaddleStreamers.SetCurrentColor)
  setCurrentColor({ patchState }: StateContext<PaddleStreamersStateModel>, { payload }: PaddleStreamers.SetCurrentColor): void {
    patchState({ currentColor: payload });
  }

  @Action(PaddleStreamers.SetForwardSpaceId)
  setForwardSpaceId({ getState, patchState }: StateContext<PaddleStreamersStateModel>, { payload }: PaddleStreamers.SetForwardSpaceId): void {
    const state = getState();

    if (state.currentColor) {
      const paddleStreamers = {...state.paddleStreamers};
      const paddleStreamer = {...paddleStreamers[state.currentColor]} as PaddleStreamer;
      paddleStreamer.forwardSpaceId = payload;
      paddleStreamers[paddleStreamer.color] = paddleStreamer;
      patchState({ paddleStreamers });
    }
  }

  @Action(PaddleStreamers.TriggerScan)
  triggerScan({ getState, patchState }: StateContext<PaddleStreamersStateModel>): void {
    const state = getState();

    if (state.currentColor) {
      const paddleStreamers = {...state.paddleStreamers};
      const paddleStreamer = {...paddleStreamers[state.currentColor]} as PaddleStreamer;
      paddleStreamer.scanTrigger = Date.now();
      paddleStreamers[paddleStreamer.color] = paddleStreamer;
      patchState({ paddleStreamers });
    }
  }
}
