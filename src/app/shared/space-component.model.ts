import { SpaceCore } from '../core/space-core.model';

export interface SpaceComponent extends SpaceCore {
  id: string;
  centerLeft: number;
  centerTop: number;
}
