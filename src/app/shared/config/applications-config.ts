import { Application, ApplicationId } from '~/shared/types/application';
import { Type } from '@angular/core';

type ApplicationOptions = Application['options'];

export const DEFAULT_APP_OPTIONS: ApplicationOptions = {
  defaultWidth: 600,
  defaultHeight: 400,
  minWidth: 200,
  minHeight: 200,
  maxInstances: 1,
  isPinnedInDock: true,
  isResizable: true,
  preserveAspectRatio: false,
};

export interface ApplicationConfig {
  id: ApplicationId;
  title: string;
  loadComponent: () => Promise<Type<any>>;
  options?: Partial<ApplicationOptions>;
}

export const applicationsConfig: Array<ApplicationConfig> = [
  {
    id: 'hello-world',
    title: 'hello world',
    loadComponent: () => import('~/applications/hello-world').then(({ HelloWorld }) => HelloWorld),
  },
  {
    id: 'test-app',
    title: 'test-app',
    loadComponent: () => import('~/applications/test-app').then(({ TestApp }) => TestApp),
  },
  {
    id: 'tic-tac-toe',
    title: 'tic tac toe',
    loadComponent: () => import('~/applications/tic-tac-toe').then(({ TicTacToe }) => TicTacToe),
    options: {
      maxInstances: 10,
      preserveAspectRatio: true,
      defaultWidth: 400,
      defaultHeight: 500,
    },
  },
];
