import { PaddleStreamer } from './paddle-streamers.model';
import { PaddleStreamerColorEnum } from '../../shared/paddle-streamer-color.enum';

export namespace PaddleStreamers {
  export class Add {
    static readonly type = '[PaddleStreamers] Add';
    constructor(public readonly payload: PaddleStreamer) { }
  }

  export class ClearHistory {
    static readonly type = '[PaddleStreamers] Clear History';
  }

  export class EndTurn {
    static readonly type = '[PaddleStreamers] End Turn';
  }

  export class MoveForward {
    static readonly type = '[PaddleStreamers] Move Forward';
  }

  export class RotateLeft {
    static readonly type = '[PaddleStreamers] Rotate Left';
  }

  export class RotateRight {
    static readonly type = '[PaddleStreamers] Rotate Right';
  }

  export class SetCurrentColor {
    static readonly type = '[PaddleStreamers] Set Current Color';
    constructor(public readonly payload: PaddleStreamerColorEnum) { }
  }

  export class SetForwardSpaceId {
    static readonly type = '[PaddleStreamers] Set Forward Space Id';
    constructor(public readonly payload?: string) { }
  }

  export class StepBack {
    static readonly type = '[PaddleStreamers] Step Back';
  }

  export class TriggerScan {
    static readonly type = '[PaddleStreamers] Trigger Scan';
  }
}
