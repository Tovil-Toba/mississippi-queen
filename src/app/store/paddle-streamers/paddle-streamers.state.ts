import { Action, State, Selector, StateContext, StateToken } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { produce } from 'immer';

import { PaddleStreamer, PaddleStreamersStateModel } from './paddle-streamers.model';
import { PaddleStreamers } from './paddle-streamers.actions';
import { PaddleStreamerColorEnum } from '../../shared/paddle-streamer-color.enum';
import { TileAngle } from '../../core/tile-angle.model';

const PADDLE_STREAMERS_TOKEN: StateToken<PaddleStreamersStateModel> = new StateToken('paddleStreamers');

const defaults = {
  currentPaddleStreamer: undefined,
  history: [],
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
  static currentAngle(state: PaddleStreamersStateModel): TileAngle {
    return state.currentColor ? state.paddleStreamers[state.currentColor]?.currentAngle ?? 0 : 0;
  }

  @Selector()
  static currentPaddleStreamer(state: PaddleStreamersStateModel): (PaddleStreamer | undefined) {
    return state.currentColor ? state.paddleStreamers[state.currentColor] : undefined;
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
  static history(state: PaddleStreamersStateModel): Array<TileAngle | string> {
    return state.history;
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
  add({ setState }: StateContext<PaddleStreamersStateModel>, { payload }: PaddleStreamers.Add): void {
    setState(produce((draft) => {
      draft.paddleStreamers[payload.color] = payload;
    }));
  }

  @Action(PaddleStreamers.ClearHistory)
  clearHistory({ patchState }: StateContext<PaddleStreamersStateModel>): void {
    patchState({ history: [] });
  }

  @Action(PaddleStreamers.EndTurn)
  endTurn({ patchState }: StateContext<PaddleStreamersStateModel>): void {
    patchState({ history: [] });
    // TODO: реализовать
  }

  @Action(PaddleStreamers.MoveForward)
  moveForward({ dispatch, getState, setState }: StateContext<PaddleStreamersStateModel>): (void | Observable<void>) {
    const state = getState();
    const currentColor = state.currentColor;

    if (!currentColor) {
      console.error('Current paddle streamer is undefined');
      return;
    }

    const forwardSpaceId = state.paddleStreamers[currentColor]?.forwardSpaceId;

    if (!forwardSpaceId) {
      console.error('Forward space ID is undefined');
      return;
    }

    setState(produce((draft) => {
      const paddleStreamer = draft.paddleStreamers[currentColor] as PaddleStreamer;
      draft.history.push(paddleStreamer.currentSpaceId as string);
      paddleStreamer.currentSpaceId = forwardSpaceId;
    }));

    return dispatch(new PaddleStreamers.TriggerScan());
  }

  @Action(PaddleStreamers.RotateLeft)
  rotateLeft({ dispatch, getState, setState }: StateContext<PaddleStreamersStateModel>): (void | Observable<void>) {
    const state = getState();
    const currentColor = state.currentColor;

    if (!currentColor || !state.paddleStreamers[currentColor]) {
      console.error('Current paddle streamer is undefined');
      return;
    }

    let currentAngle = state.paddleStreamers[currentColor]?.currentAngle as TileAngle;
    if (currentAngle === 0) {
      currentAngle = 360;
    }
    currentAngle -= 60;

    setState(produce((draft) => {
      const paddleStreamer = draft.paddleStreamers[currentColor] as PaddleStreamer;
      draft.history.push(paddleStreamer.currentAngle);
      paddleStreamer.currentAngle = currentAngle;
    }));

    return dispatch(new PaddleStreamers.TriggerScan());
  }

  @Action(PaddleStreamers.RotateRight)
  rotateRight({ dispatch, getState, setState }: StateContext<PaddleStreamersStateModel>): (void | Observable<void>) {
    const state = getState();
    const currentColor = state.currentColor;

    if (!currentColor || !state.paddleStreamers[currentColor]) {
      console.error('Current paddle streamer is undefined');
      return;
    }

    let currentAngle = state.paddleStreamers[currentColor]?.currentAngle as TileAngle;
    if (currentAngle === 360) {
      currentAngle = 0;
    }
    currentAngle += 60;

    setState(produce((draft) => {
      const paddleStreamer = draft.paddleStreamers[currentColor] as PaddleStreamer;
      draft.history.push(paddleStreamer.currentAngle);
      paddleStreamer.currentAngle = currentAngle;
    }));

    return dispatch(new PaddleStreamers.TriggerScan());
  }

  @Action(PaddleStreamers.SetCurrentColor)
  setCurrentColor({ patchState }: StateContext<PaddleStreamersStateModel>, { payload }: PaddleStreamers.SetCurrentColor): void {
    patchState({ currentColor: payload });
  }

  @Action(PaddleStreamers.SetForwardSpaceId)
  setForwardSpaceId({ getState, setState }: StateContext<PaddleStreamersStateModel>, { payload }: PaddleStreamers.SetForwardSpaceId): void {
    const state = getState();
    const currentColor = state.currentColor;

    if (!currentColor || !state.paddleStreamers[currentColor]) {
      console.error('Current paddle streamer is undefined');
      return;
    }

    setState(produce((draft) => {
      (draft.paddleStreamers[currentColor] as PaddleStreamer).forwardSpaceId = payload;
    }));
  }

  @Action(PaddleStreamers.StepBack)
  stepBack({ dispatch, getState, setState }: StateContext<PaddleStreamersStateModel>): (void | Observable<void>) {
    const state = getState();

    if (!state.history.length) {
      return;
    }

    const currentColor = state.currentColor;

    if (!currentColor || !state.paddleStreamers[currentColor]) {
      console.error('Current paddle streamer is undefined');
      return;
    }

    const lastStep = state.history[state.history.length - 1];

    setState(produce((draft) => {
      const paddleStreamer = draft.paddleStreamers[currentColor] as PaddleStreamer;
      if (typeof lastStep === 'string') {
        paddleStreamer.currentSpaceId = lastStep;
      } else {
        paddleStreamer.currentAngle = lastStep;
      }
      draft.history.pop();
    }));

    return dispatch(new PaddleStreamers.TriggerScan());
  }

  @Action(PaddleStreamers.TriggerScan)
  triggerScan({ getState, setState }: StateContext<PaddleStreamersStateModel>): void {
    const state = getState();
    const currentColor = state.currentColor;

    if (!currentColor || !state.paddleStreamers[currentColor]) {
      console.error('Current paddle streamer is undefined');
      return;
    }

    setState(produce((draft) => {
      (draft.paddleStreamers[currentColor] as PaddleStreamer).scanTrigger = Date.now();
    }));
  }
}
