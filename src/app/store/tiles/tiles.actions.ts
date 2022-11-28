import { TileComponent } from '../../shared/tile-component.model';
import { TileId } from '../../core/tile-id.model';

export namespace Tiles {
  export class Add {
    static readonly type = '[Tiles] Add';

    constructor(public readonly payload: TileComponent) { }
  }

  export class AddTriggeredId {
    static readonly type = '[Tiles] Add Triggered Id';

    constructor(public readonly payload: TileId) { }
  }

  export class Set {
    static readonly type = '[Tiles] Set';

    constructor(public readonly payload: Array<TileComponent>) { }
  }

  export class TriggerNew {
    static readonly type = '[Tiles] Trigger New';
  }
}

