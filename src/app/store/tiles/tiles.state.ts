import { Action, State, Selector, StateContext, StateToken } from '@ngxs/store';
import { Injectable } from '@angular/core';

import { TileComponent } from '../../shared/tile-component.model';
import { TileId } from '../../core/tile-id.model';
import { Tiles } from './tiles.actions';
import { TilesStateModel } from './tiles.model';

const TILES_TOKEN: StateToken<TilesStateModel> = new StateToken('tiles');

const defaults = {
  newTileTrigger: 0,
  tiles: [],
  triggeredTileIds: []
};

@State<TilesStateModel>({
  name: TILES_TOKEN,
  defaults
})
@Injectable()
export class TilesState {
  @Selector()
  static newTileTrigger(state: TilesStateModel): number {
    return state.newTileTrigger;
  }

  @Selector()
  static tile(state: TilesStateModel): (id: TileId | string) => (TileComponent | undefined) {
    return (id: TileId | string): (TileComponent | undefined) => {
      if (id.indexOf('|') >= 0) {
        id = id.split('|')?.[0] as TileId;
      }

      return state.tiles.find((tile) => tile.id === id);
    };
  }

  @Selector()
  static tiles(state: TilesStateModel): Array<TileComponent> {
    return state.tiles;
  }

  @Selector()
  static triggeredTileIds(state: TilesStateModel): Array<TileId> {
    return state.triggeredTileIds;
  }

  @Action(Tiles.Add)
  add({ getState, patchState }: StateContext<TilesStateModel>, { payload }: Tiles.Add): void {
    const state = getState();
    patchState({
      tiles: [ ...state.tiles, payload ]
    });
  }

  @Action(Tiles.AddTriggeredId)
  addTriggeredId({ getState, patchState }: StateContext<TilesStateModel>, { payload }: Tiles.AddTriggeredId): void {
    const state = getState();
    patchState({
      triggeredTileIds: [ ...state.triggeredTileIds, payload ]
    });
  }

  @Action(Tiles.Set)
  set({ patchState }: StateContext<TilesStateModel>, { payload }: Tiles.Set): void {
    patchState({
      tiles: payload
    });
  }

  @Action(Tiles.TriggerNew)
  triggerNew({ patchState }: StateContext<TilesStateModel>): void {
    patchState({
      newTileTrigger: Date.now()
    });
  }
}
