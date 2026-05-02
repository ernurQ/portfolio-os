import { Type } from '@angular/core';

export type ApplicationId = string;

export interface ApplicationSize {
  width: number;
  height: number;
}

export interface ApplicationPosition {
  x: number;
  y: number;
}

export interface Application {
  id: ApplicationId;
  title: string;
  loadComponent: () => Promise<Type<any>>;
  options: {
    defaultWidth: number;
    defaultHeight: number;
    minWidth: number;
    minHeight: number;
    maxInstances: number;
    isPinnedInDock: boolean;
    isResizable: boolean;
    preserveAspectRatio: boolean;
  };
}
