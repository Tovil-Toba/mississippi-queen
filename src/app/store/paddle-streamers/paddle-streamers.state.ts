import { Action, State, Selector, StateContext, StateToken, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { produce } from 'immer';

import { PaddleStreamer, PaddleStreamersStateModel } from './paddle-streamers.model';
import { PaddleStreamers } from './paddle-streamers.actions';
import { PaddleStreamerColorEnum } from '../../shared/paddle-streamer-color.enum';
import { SettingsService } from '../../core/settings.service';
import { Speed } from '../../core/speed.model';
import { TileAngle } from '../../core/tile-angle.model';
import { TilesState } from '../tiles/tiles.state';

const PADDLE_STREAMERS_TOKEN: StateToken<PaddleStreamersStateModel> = new StateToken('paddleStreamers');

const defaults = {
  currentPaddleStreamer: undefined,
  finishedColors: [],
  history: [],
  initialSpeed: undefined,
  isFreeSpeedChangeUsed: false,
  order: [],
  paddleStreamers: {},
};

@State<PaddleStreamersStateModel>({
  name: PADDLE_STREAMERS_TOKEN,
  defaults
})
@Injectable()
export class PaddleStreamersState {
  constructor(private settings: SettingsService, private store: Store) {}

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
  static finishedColors(state: PaddleStreamersStateModel): string[] {
    return state.finishedColors;
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
  static initialSpeed(state: PaddleStreamersStateModel): (Speed | undefined) {
    return state.initialSpeed;
  }

  @Selector()
  static isFreeSpeedChangeUsed(state: PaddleStreamersStateModel): (boolean | undefined) {
    return state.isFreeSpeedChangeUsed;
  }

  @Selector()
  static paddleStreamer(
    state: PaddleStreamersStateModel
  ): (colorOrSpaceId: PaddleStreamerColorEnum | string) => (PaddleStreamer | undefined) {
    return (colorOrSpaceId: PaddleStreamerColorEnum | string): (PaddleStreamer | undefined) => {
      return Object.values((state.paddleStreamers))
        .find((paddleStreamer) => (
          paddleStreamer.color === colorOrSpaceId || paddleStreamer.currentSpaceId === colorOrSpaceId
        ));
    };
  }

  @Selector()
  static scanTrigger(state: PaddleStreamersStateModel): number {
    return state.currentColor ? state.paddleStreamers[state.currentColor]?.scanTrigger ?? 0 : 0;
  }

  @Action(PaddleStreamers.Add)
  add(
    ctx: StateContext<PaddleStreamersStateModel>,
    { payload }: PaddleStreamers.Add
  ): void {
    ctx.setState(produce((draft) => {
      draft.paddleStreamers[payload.color] = payload;
    }));
  }

  @Action(PaddleStreamers.ClearHistory)
  clearHistory(ctx: StateContext<PaddleStreamersStateModel>): void {
    ctx.patchState({ history: [] });
  }

  @Action(PaddleStreamers.DecrementSpeed)
  decrementSpeed(ctx: StateContext<PaddleStreamersStateModel>): (void | Observable<void>) {
    const state = ctx.getState();
    const currentColor = state.currentColor;

    if (!currentColor) {
      console.error('Current paddle streamer is undefined');
      return;
    }

    const speed = state.paddleStreamers[currentColor]?.speed;

    if (speed === 1) {
      console.error('Speed cannot be less than 1');
      return;
    }

    ctx.setState(produce((draft) => {
      const paddleStreamer = draft.paddleStreamers[currentColor] as PaddleStreamer;

      if (!draft.initialSpeed) {
        draft.initialSpeed = paddleStreamer.speed;
      }

      paddleStreamer.speed--;
      draft.isFreeSpeedChangeUsed = paddleStreamer.speed !== draft.initialSpeed;

      if (paddleStreamer.speed < (draft.initialSpeed - 1)) {
        paddleStreamer.coal--;
      } else if (paddleStreamer.speed > draft.initialSpeed){
        paddleStreamer.coal++;
      }
    }));
  }

  @Action(PaddleStreamers.EndTurn)
  endTurn(ctx: StateContext<PaddleStreamersStateModel>): void {
    const state = ctx.getState();
    const currentColor = state.currentColor;

    if (!currentColor) {
      console.error('Current paddle streamer is undefined');
      return;
    }

    const paddleStreamer = state.paddleStreamers[currentColor] as PaddleStreamer;
    const finishSpaceIds = this.store.selectSnapshot(TilesState.finishSpaceIds);
    const maxTilesCount = this.settings.maxTilesCount;
    const tilesCount = this.store.selectSnapshot(TilesState.tilesCount);
    let finishedColors = state.finishedColors;

    if (tilesCount === maxTilesCount &&
      finishSpaceIds.includes(paddleStreamer.currentSpaceId as string) &&
      paddleStreamer.speed === 1
    ) {
      finishedColors = [...finishedColors, currentColor];
    }

    ctx.patchState({
      finishedColors,
      history: [],
      initialSpeed: undefined,
      isFreeSpeedChangeUsed: false
    });
  }

  @Action(PaddleStreamers.IncrementSpeed)
  incrementSpeed(ctx: StateContext<PaddleStreamersStateModel>
  ): (void | Observable<void>) {
    const state = ctx.getState();
    const currentColor = state.currentColor;

    if (!currentColor) {
      console.error('Current paddle streamer is undefined');
      return;
    }

    const speed = state.paddleStreamers[currentColor]?.speed;

    if (speed === 6) {
      console.error('Speed cannot be more than 6');
      return;
    }

    ctx.setState(produce((draft) => {
      const paddleStreamer = draft.paddleStreamers[currentColor] as PaddleStreamer;

      if (!draft.initialSpeed) {
        draft.initialSpeed = paddleStreamer.speed;
      }

      paddleStreamer.speed++;
      draft.isFreeSpeedChangeUsed = paddleStreamer.speed !== draft.initialSpeed;

      if (paddleStreamer.speed > (draft.initialSpeed + 1)) {
        paddleStreamer.coal--;
      } else if (paddleStreamer.speed < draft.initialSpeed){
        paddleStreamer.coal++;
      }
    }));
  }

  @Action(PaddleStreamers.MoveForward)
  moveForward(ctx: StateContext<PaddleStreamersStateModel>): (void | Observable<void>) {
    const state = ctx.getState();
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

    ctx.setState(produce((draft) => {
      const paddleStreamer = draft.paddleStreamers[currentColor] as PaddleStreamer;
      draft.history.push(paddleStreamer.currentSpaceId as string);
      paddleStreamer.currentSpaceId = forwardSpaceId;
    }));

    return ctx.dispatch(new PaddleStreamers.TriggerScan());
  }

  @Action(PaddleStreamers.RotateLeft)
  rotateLeft(ctx: StateContext<PaddleStreamersStateModel>): (void | Observable<void>) {
    const state = ctx.getState();
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

    return ctx.dispatch(new PaddleStreamers.SetCurrentAngle(currentAngle as TileAngle));
  }

  @Action(PaddleStreamers.RotateRight)
  rotateRight(ctx: StateContext<PaddleStreamersStateModel>): (void | Observable<void>) {
    const state = ctx.getState();
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

    if (currentAngle === 360) {
      currentAngle = 0;
    }

    return ctx.dispatch(new PaddleStreamers.SetCurrentAngle(currentAngle as TileAngle));
  }

  @Action(PaddleStreamers.SetCurrentAngle)
  setCurrentAngle(
    ctx: StateContext<PaddleStreamersStateModel>,
    { payload }: PaddleStreamers.SetCurrentAngle
  ): (void | Observable<void>) {
    const state = ctx.getState();
    const currentColor = state.currentColor;

    if (!currentColor || !state.paddleStreamers[currentColor]) {
      console.error('Current paddle streamer is undefined');
      return;
    }

    const lastStep = state.history[state.history.length - 1]; // .at(-1)
    const historyAnglesCount = state.history.filter((item) => typeof item !== 'string').length;

    ctx.setState(produce((draft) => {
      const paddleStreamer = draft.paddleStreamers[currentColor] as PaddleStreamer;

      if (typeof lastStep !== 'string' && lastStep === payload) {
        if (historyAnglesCount > 1) {
          paddleStreamer.coal++;
        }

        draft.history.pop();
      } else {
        if (historyAnglesCount) {
          paddleStreamer.coal--;
        }

        draft.history.push(paddleStreamer.currentAngle);
      }

      paddleStreamer.currentAngle = payload;
    }));

    return ctx.dispatch(new PaddleStreamers.TriggerScan());
  }

  @Action(PaddleStreamers.SetCurrentColor)
  setCurrentColor(
    ctx: StateContext<PaddleStreamersStateModel>,
    { payload }: PaddleStreamers.SetCurrentColor
  ): void {
    ctx.patchState({ currentColor: payload });
  }

  @Action(PaddleStreamers.SetForwardSpaceId)
  setForwardSpaceId(
    ctx: StateContext<PaddleStreamersStateModel>,
    { payload }: PaddleStreamers.SetForwardSpaceId
  ): void {
    const state = ctx.getState();
    const currentColor = state.currentColor;

    if (!currentColor || !state.paddleStreamers[currentColor]) {
      console.error('Current paddle streamer is undefined');
      return;
    }

    ctx.setState(produce((draft) => {
      (draft.paddleStreamers[currentColor] as PaddleStreamer).forwardSpaceId = payload;
    }));
  }

  @Action(PaddleStreamers.StepBack)
  stepBack(ctx: StateContext<PaddleStreamersStateModel>): (void | Observable<void>) {
    const state = ctx.getState();

    if (!state.history.length) {
      return;
    }

    const currentColor = state.currentColor;

    if (!currentColor || !state.paddleStreamers[currentColor]) {
      console.error('Current paddle streamer is undefined');
      return;
    }

    const lastStep = state.history[state.history.length - 1];
    const historyAnglesCount = state.history.filter((item) => typeof item !== 'string').length;

    ctx.setState(produce((draft) => {
      const paddleStreamer = draft.paddleStreamers[currentColor] as PaddleStreamer;
      if (typeof lastStep === 'string') {
        paddleStreamer.currentSpaceId = lastStep;
      } else {
        paddleStreamer.currentAngle = lastStep;

        if (historyAnglesCount > 1) {
          paddleStreamer.coal++;
        }
      }

      draft.history.pop();
    }));

    return ctx.dispatch(new PaddleStreamers.TriggerScan());
  }

  @Action(PaddleStreamers.TriggerScan)
  triggerScan(ctx: StateContext<PaddleStreamersStateModel>): void {
    const state = ctx.getState();
    const currentColor = state.currentColor;

    if (!currentColor || !state.paddleStreamers[currentColor]) {
      console.error('Current paddle streamer is undefined');
      return;
    }

    ctx.setState(produce((draft) => {
      (draft.paddleStreamers[currentColor] as PaddleStreamer).scanTrigger = Date.now();
    }));
  }
}
