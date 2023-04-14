import { IEvent } from './event.model';
import { IEventArray } from '../../Events/events.controller';

export interface ICreateRecursionResponse {
  status: number;
  message: string;
  id: string;
}

export interface ICreateRecursionPayload {
  body: IEvent;
  manageeId: number | undefined | null;
  workspaceId?: string | undefined | null;
}

export interface TimeUpdatePayload {
  toBeRemoved?: string[];
  toBeAdded?: IEventArray[];
}

export interface IUpdateRecursion {
  id?: string;
  title?: string;
  description?: string;
  workspaceId?: string;
  creator?: number;
  colorId?: number;
  linkId?: number;
  manageeId?: number;
  calendarId?: number;
}
