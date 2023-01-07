import { PaddleSteamer } from '../../core/paddle-steamer.model';
import { PaddleSteamerColorEnum } from '../../core/paddle-steamer-color.enum';
import { TileAngle } from '../../core/tile-angle.model';

export namespace PaddleSteamers {
  export class Add {
    static readonly type = '[PaddleSteamers] Add';

    constructor(public readonly payload: PaddleSteamer) { }
  }

  export class ClearHistory {
    static readonly type = '[PaddleSteamers] Clear History';
  }

  export class DecrementSpeed {
    static readonly type = '[PaddleSteamers] Decrement Speed';
  }

  export class EndTurn {
    static readonly type = '[PaddleSteamers] End Turn';
  }

  export class IncrementSpeed {
    static readonly type = '[PaddleSteamers] Increment Speed';
  }

  export class MoveForward {
    static readonly type = '[PaddleSteamers] Move Forward';
  }

  export class RotateLeft {
    static readonly type = '[PaddleSteamers] Rotate Left';
  }

  export class RotateRight {
    static readonly type = '[PaddleSteamers] Rotate Right';
  }

  export class SetCurrentAngle {
    static readonly type = '[PaddleSteamers] Set Current Angle';

    constructor(public readonly payload: TileAngle) { }
  }

  export class SetCurrentColor {
    static readonly type = '[PaddleSteamers] Set Current Color';

    constructor(public readonly payload: PaddleSteamerColorEnum) { }
  }

  export class SetForwardSpaceId {
    static readonly type = '[PaddleSteamers] Set Forward Space Id';

    constructor(public readonly payload?: string) { }
  }

  export class StepBack {
    static readonly type = '[PaddleSteamers] Step Back';
  }

  export class TriggerScan {
    static readonly type = '[PaddleSteamers] Trigger Scan';
  }
}
