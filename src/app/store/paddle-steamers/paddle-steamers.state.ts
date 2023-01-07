import { Action, State, Selector, StateContext, StateToken, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { produce } from 'immer';

import { PaddleSteamer } from '../../core/paddle-steamer.model';
import { PaddleSteamers } from './paddle-steamers.actions';
import { PaddleSteamerColorEnum } from '../../core/paddle-steamer-color.enum';
import { PaddleSteamersStateModel } from './paddle-steamers.model';
import { SettingsService } from '../../core/settings.service';
import { Speed } from '../../core/speed.model';
import { TileAngle } from '../../core/tile-angle.model';
import { TilesState } from '../tiles/tiles.state';

const PADDLE_STEAMERS_TOKEN: StateToken<PaddleSteamersStateModel> = new StateToken('paddleSteamers');

const defaults = {
  currentPaddleSteamer: undefined,
  finishedColors: [],
  history: [],
  initialSpeed: undefined,
  isFreeSpeedChangeUsed: false,
  order: [],
  paddleSteamers: {},
};

@State<PaddleSteamersStateModel>({
  name: PADDLE_STEAMERS_TOKEN,
  defaults
})
@Injectable()
export class PaddleSteamersState {
  constructor(private settings: SettingsService, private store: Store) {}

  @Selector()
  static currentAngle(state: PaddleSteamersStateModel): (color: PaddleSteamerColorEnum) => TileAngle {
    return (color: PaddleSteamerColorEnum): TileAngle => {
      return state.paddleSteamers[color]?.currentAngle ?? 0;
    };
  }

  @Selector()
  static currentColor(state: PaddleSteamersStateModel): PaddleSteamerColorEnum | undefined {
    return state.currentColor;
  }

  @Selector()
  static currentPaddleSteamer(state: PaddleSteamersStateModel): (PaddleSteamer | undefined) {
    return state.currentColor ? state.paddleSteamers[state.currentColor] : undefined;
  }

  @Selector()
  static finishedColors(state: PaddleSteamersStateModel): string[] {
    return state.finishedColors;
  }

  @Selector()
  static forwardSpaceId(state: PaddleSteamersStateModel): (string | undefined) {
    return state.currentColor ? state.paddleSteamers[state.currentColor]?.forwardSpaceId : undefined;
  }

  @Selector()
  static history(state: PaddleSteamersStateModel): Array<TileAngle | string> {
    return state.history;
  }

  @Selector()
  static initialSpeed(state: PaddleSteamersStateModel): (Speed | undefined) {
    return state.initialSpeed;
  }

  @Selector()
  static isFreeSpeedChangeUsed(state: PaddleSteamersStateModel): (boolean | undefined) {
    return state.isFreeSpeedChangeUsed;
  }

  @Selector()
  static paddleSteamer(
    state: PaddleSteamersStateModel
  ): (colorOrSpaceId: PaddleSteamerColorEnum | string) => (PaddleSteamer | undefined) {
    return (colorOrSpaceId: PaddleSteamerColorEnum | string): (PaddleSteamer | undefined) => {
      return Object.values((state.paddleSteamers))
        .find((paddleSteamer) => (
          paddleSteamer.color === colorOrSpaceId || paddleSteamer.currentSpaceId === colorOrSpaceId
        ));
    };
  }

  @Selector()
  static scanTrigger(state: PaddleSteamersStateModel): (color: PaddleSteamerColorEnum) => number {
    return (color: PaddleSteamerColorEnum): number => {
      const paddleSteamer = state.paddleSteamers[color] as PaddleSteamer;
      return paddleSteamer.scanTrigger;
    };
  }

  @Action(PaddleSteamers.Add)
  add(
    ctx: StateContext<PaddleSteamersStateModel>,
    { payload }: PaddleSteamers.Add
  ): void {
    ctx.setState(produce((draft) => {
      draft.paddleSteamers[payload.color] = payload;
      draft.order.push(payload.color);
    }));
  }

  @Action(PaddleSteamers.ClearHistory)
  clearHistory(ctx: StateContext<PaddleSteamersStateModel>): void {
    ctx.patchState({ history: [] });
  }

  @Action(PaddleSteamers.DecrementSpeed)
  decrementSpeed(ctx: StateContext<PaddleSteamersStateModel>): (void | Observable<void>) {
    const state = ctx.getState();
    const currentColor = state.currentColor;

    if (!currentColor) {
      console.error('Current paddle steamer is undefined');
      return;
    }

    const speed = state.paddleSteamers[currentColor]?.speed;

    if (speed === 1) {
      console.error('Speed cannot be less than 1');
      return;
    }

    ctx.setState(produce((draft) => {
      const paddleSteamer = draft.paddleSteamers[currentColor] as PaddleSteamer;

      if (!draft.initialSpeed) {
        draft.initialSpeed = paddleSteamer.speed;
      }

      paddleSteamer.speed--;
      draft.isFreeSpeedChangeUsed = paddleSteamer.speed !== draft.initialSpeed;

      if (paddleSteamer.speed < (draft.initialSpeed - 1)) {
        paddleSteamer.coal--;
      } else if (paddleSteamer.speed > draft.initialSpeed){
        paddleSteamer.coal++;
      }
    }));
  }

  @Action(PaddleSteamers.EndTurn)
  endTurn(ctx: StateContext<PaddleSteamersStateModel>): void {
    const state = ctx.getState();
    const currentColor = state.currentColor;

    if (!currentColor) {
      console.error('Current paddle steamer is undefined');
      return;
    }

    const paddleSteamers = state.paddleSteamers;
    const paddleSteamer = paddleSteamers[currentColor] as PaddleSteamer;
    const finishSpaceIds = this.store.selectSnapshot(TilesState.finishSpaceIds);
    const maxTilesCount = this.settings.maxTilesCount;
    const tilesCount = this.store.selectSnapshot(TilesState.tilesCount);
    let order = [...state.order];
    const currentColorOrderIndex = order.indexOf(currentColor);
    const nextColor = order[currentColorOrderIndex + 1] ?? order[0];
    let finishedColors = state.finishedColors;

    if (tilesCount === maxTilesCount &&
      finishSpaceIds.includes(paddleSteamer.currentSpaceId as string) &&
      paddleSteamer.speed === 1
    ) {
      finishedColors = [...finishedColors, currentColor];
      order = order.splice(currentColorOrderIndex, 1);
      // delete paddleSteamers[currentColor];
    }

    ctx.patchState({
      currentColor: nextColor,
      finishedColors,
      history: [],
      initialSpeed: undefined,
      isFreeSpeedChangeUsed: false,
      order
    });
  }

  @Action(PaddleSteamers.IncrementSpeed)
  incrementSpeed(ctx: StateContext<PaddleSteamersStateModel>
  ): (void | Observable<void>) {
    const state = ctx.getState();
    const currentColor = state.currentColor;

    if (!currentColor) {
      console.error('Current paddle steamer is undefined');
      return;
    }

    const speed = state.paddleSteamers[currentColor]?.speed;

    if (speed === 6) {
      console.error('Speed cannot be more than 6');
      return;
    }

    ctx.setState(produce((draft) => {
      const paddleSteamer = draft.paddleSteamers[currentColor] as PaddleSteamer;

      if (!draft.initialSpeed) {
        draft.initialSpeed = paddleSteamer.speed;
      }

      paddleSteamer.speed++;
      draft.isFreeSpeedChangeUsed = paddleSteamer.speed !== draft.initialSpeed;

      if (paddleSteamer.speed > (draft.initialSpeed + 1)) {
        paddleSteamer.coal--;
      } else if (paddleSteamer.speed < draft.initialSpeed){
        paddleSteamer.coal++;
      }
    }));
  }

  @Action(PaddleSteamers.MoveForward)
  moveForward(ctx: StateContext<PaddleSteamersStateModel>): (void | Observable<void>) {
    const state = ctx.getState();
    const currentColor = state.currentColor;

    if (!currentColor) {
      console.error('Current paddle steamer is undefined');
      return;
    }

    const forwardSpaceId = state.paddleSteamers[currentColor]?.forwardSpaceId;

    if (!forwardSpaceId) {
      console.error('Forward space ID is undefined');
      return;
    }

    ctx.setState(produce((draft) => {
      const paddleSteamer = draft.paddleSteamers[currentColor] as PaddleSteamer;
      draft.history.push(paddleSteamer.currentSpaceId as string);
      paddleSteamer.currentSpaceId = forwardSpaceId;
    }));

    return ctx.dispatch(new PaddleSteamers.TriggerScan());
  }

  @Action(PaddleSteamers.RotateLeft)
  rotateLeft(ctx: StateContext<PaddleSteamersStateModel>): (void | Observable<void>) {
    const state = ctx.getState();
    const currentColor = state.currentColor;

    if (!currentColor || !state.paddleSteamers[currentColor]) {
      console.error('Current paddle steamer is undefined');
      return;
    }

    let currentAngle = state.paddleSteamers[currentColor]?.currentAngle as TileAngle;

    if (currentAngle === 0) {
      currentAngle = 360;
    }

    currentAngle -= 60;

    return ctx.dispatch(new PaddleSteamers.SetCurrentAngle(currentAngle as TileAngle));
  }

  @Action(PaddleSteamers.RotateRight)
  rotateRight(ctx: StateContext<PaddleSteamersStateModel>): (void | Observable<void>) {
    const state = ctx.getState();
    const currentColor = state.currentColor;

    if (!currentColor || !state.paddleSteamers[currentColor]) {
      console.error('Current paddle steamer is undefined');
      return;
    }

    let currentAngle = state.paddleSteamers[currentColor]?.currentAngle as TileAngle;

    if (currentAngle === 360) {
      currentAngle = 0;
    }

    currentAngle += 60;

    if (currentAngle === 360) {
      currentAngle = 0;
    }

    return ctx.dispatch(new PaddleSteamers.SetCurrentAngle(currentAngle as TileAngle));
  }

  @Action(PaddleSteamers.SetCurrentAngle)
  setCurrentAngle(
    ctx: StateContext<PaddleSteamersStateModel>,
    { payload }: PaddleSteamers.SetCurrentAngle
  ): (void | Observable<void>) {
    const state = ctx.getState();
    const currentColor = state.currentColor;

    if (!currentColor || !state.paddleSteamers[currentColor]) {
      console.error('Current paddle steamer is undefined');
      return;
    }

    const lastStep = state.history[state.history.length - 1]; // .at(-1)
    const historyAnglesCount = state.history.filter((item) => typeof item !== 'string').length;

    ctx.setState(produce((draft) => {
      const paddleSteamer = draft.paddleSteamers[currentColor] as PaddleSteamer;

      if (typeof lastStep !== 'string' && lastStep === payload) {
        if (historyAnglesCount > 1) {
          paddleSteamer.coal++;
        }

        draft.history.pop();
      } else {
        if (historyAnglesCount) {
          paddleSteamer.coal--;
        }

        draft.history.push(paddleSteamer.currentAngle);
      }

      paddleSteamer.currentAngle = payload;
    }));

    return ctx.dispatch(new PaddleSteamers.TriggerScan());
  }

  @Action(PaddleSteamers.SetCurrentColor)
  setCurrentColor(
    ctx: StateContext<PaddleSteamersStateModel>,
    { payload }: PaddleSteamers.SetCurrentColor
  ): void {
    ctx.patchState({ currentColor: payload });
  }

  @Action(PaddleSteamers.SetForwardSpaceId)
  setForwardSpaceId(
    ctx: StateContext<PaddleSteamersStateModel>,
    { payload }: PaddleSteamers.SetForwardSpaceId
  ): void {
    const state = ctx.getState();
    const currentColor = state.currentColor;

    if (!currentColor || !state.paddleSteamers[currentColor]) {
      console.error('Current paddle steamer is undefined');
      return;
    }

    ctx.setState(produce((draft) => {
      (draft.paddleSteamers[currentColor] as PaddleSteamer).forwardSpaceId = payload;
    }));
  }

  @Action(PaddleSteamers.StepBack)
  stepBack(ctx: StateContext<PaddleSteamersStateModel>): (void | Observable<void>) {
    const state = ctx.getState();

    if (!state.history.length) {
      return;
    }

    const currentColor = state.currentColor;

    if (!currentColor || !state.paddleSteamers[currentColor]) {
      console.error('Current paddle steamer is undefined');
      return;
    }

    const lastStep = state.history[state.history.length - 1];
    const historyAnglesCount = state.history.filter((item) => typeof item !== 'string').length;

    ctx.setState(produce((draft) => {
      const paddleSteamer = draft.paddleSteamers[currentColor] as PaddleSteamer;
      if (typeof lastStep === 'string') {
        paddleSteamer.currentSpaceId = lastStep;
      } else {
        paddleSteamer.currentAngle = lastStep;

        if (historyAnglesCount > 1) {
          paddleSteamer.coal++;
        }
      }

      draft.history.pop();
    }));

    return ctx.dispatch(new PaddleSteamers.TriggerScan());
  }

  @Action(PaddleSteamers.TriggerScan)
  triggerScan(ctx: StateContext<PaddleSteamersStateModel>): void {
    const state = ctx.getState();
    const currentColor = state.currentColor;

    if (!currentColor || !state.paddleSteamers[currentColor]) {
      console.error('Current paddle steamer is undefined');
      return;
    }

    ctx.setState(produce((draft) => {
      (draft.paddleSteamers[currentColor] as PaddleSteamer).scanTrigger = Date.now();
    }));
  }
}
