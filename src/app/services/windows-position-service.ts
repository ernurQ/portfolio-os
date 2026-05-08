import { Injectable } from '@angular/core';
import { WindowId } from '~/shared/types/window';
import { ApplicationPosition } from '~/shared/types/application';
import { z } from 'zod';

const WindowPositionStoreSchema = z.object({
  windows: z.record(
    z.string(),
    z.object({
      x: z.number(),
      y: z.number(),
    }),
  ),
  version: z.number(),
});

type WindowPositionStore = z.infer<typeof WindowPositionStoreSchema>;

@Injectable({
  providedIn: 'root',
})
export class WindowsPositionService {
  private readonly _storageKey = 'window-position';
  private readonly _version = 1;
  private readonly _store: WindowPositionStore;

  constructor() {
    this._store = this.loadStore();
  }

  getWindowPosition(windowId: WindowId): ApplicationPosition {
    return this._store.windows[windowId] ?? { x: 0, y: 0 };
  }

  saveWindowPosition(windowId: WindowId, position: ApplicationPosition): void {
    this._store.windows[windowId] = position;
    localStorage.setItem(this._storageKey, JSON.stringify(this._store));
  }

  syncWindowsStore(windowsIds: Array<{ id: WindowId }>) {
    const activeWindowIdsSet = new Set(windowsIds.map(({ id }) => id));
    const newStoreWindows: WindowPositionStore['windows'] = {};
    Object.entries(this._store.windows).forEach(([storeWindowId, position]) => {
      if (activeWindowIdsSet.has(storeWindowId)) {
        newStoreWindows[storeWindowId] = position;
      }
    });
    this._store.windows = newStoreWindows;
    localStorage.setItem(this._storageKey, JSON.stringify(this._store));
  }

  private loadStore(): WindowPositionStore {
    const defaultStore: WindowPositionStore = {
      windows: {},
      version: this._version,
    };
    try {
      const storeString = localStorage.getItem(this._storageKey);
      if (!storeString) {
        return defaultStore;
      }
      const parsedStore = JSON.parse(storeString);
      return WindowPositionStoreSchema.parse(parsedStore);
    } catch {
      localStorage.removeItem(this._storageKey);
      return defaultStore;
    }
  }
}
