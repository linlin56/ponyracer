import { PonyModel } from './pony.model';

export type RaceStatus = 'PENDING' | 'RUNNING' | 'FINISHED';

export interface RaceModel {
  id: number;
  name: string;
  ponies: PonyModel[];
  startInstant: string;
  status: RaceStatus;
  betPonyId?: number;
}

export interface RacePositionModel {
  ponies: PonyModel[];
  status: RaceStatus;
}
