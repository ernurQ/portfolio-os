import { ApplicationId, ApplicationPosition, ApplicationSize } from './application';

export type WindowId = string;

export interface Window {
  id: WindowId;
  appId: ApplicationId;
  zIndex: number;
  initialPosition: ApplicationPosition;
  initialSize: ApplicationSize;
}
