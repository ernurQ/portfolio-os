import { Injectable } from '@angular/core';
import { z } from 'zod';
import {
  ApplicationId,
  ApplicationPosition,
  ApplicationSize,
} from '~/shared/types/application';

const ApplicationPositionSchema = z.object({
  applications: z.record(
    z.string(),
    z.object({
      x: z.number(),
      y: z.number(),
    }),
  ),
  version: z.number(),
});

type ApplicationPositionStore = z.infer<typeof ApplicationPositionSchema>;

@Injectable({
  providedIn: 'root',
})
export class ApplicationPositionService {
  private readonly _storageKey = 'application-positions';
  private readonly _version = 1;
  private readonly _store: ApplicationPositionStore;

  constructor() {
    this._store = this.loadStore();
  }

  getApplicationPosition(
    appId: ApplicationId,
    appSize: ApplicationSize,
    offset: number = 0,
  ): ApplicationPosition {
    const position = this._store.applications[appId];

    let targetX;
    let targetY;
    if (!position) {
      targetX = (window.innerWidth - appSize.width) / 2;
      targetY = (window.innerHeight - appSize.height) / 2;
    } else {
      targetX = position.x;
      targetY = position.y;
    }

    const maxX = window.innerWidth - appSize.width;
    const maxY = window.innerHeight - appSize.height;
    return {
      x: Math.max(0, Math.min(targetX + offset, maxX)),
      y: Math.max(0, Math.min(targetY + offset, maxY)),
    };
  }

  saveApplicationPosition(appId: ApplicationId, position: ApplicationPosition) {
    this._store.applications[appId] = {
      x: position.x,
      y: position.y,
    };
    localStorage.setItem(this._storageKey, JSON.stringify(this._store));
  }

  private loadStore(): ApplicationPositionStore {
    const defaultStore: ApplicationPositionStore = {
      applications: {},
      version: this._version,
    };
    try {
      const storeString = localStorage.getItem(this._storageKey);
      if (!storeString) return defaultStore;
      const parsedStore = JSON.parse(storeString);
      return ApplicationPositionSchema.parse(parsedStore);
    } catch {
      localStorage.removeItem(this._storageKey);
      return defaultStore;
    }
  }
}
