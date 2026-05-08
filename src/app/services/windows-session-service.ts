import { Injectable } from '@angular/core';
import { z } from 'zod';
import { Window, WindowId } from '~/shared/types/window';

const WindowsSessionSchema = z.object({
  version: z.number(),
  windows: z.record(
    z.string(),
    z.object({
      id: z.string(),
      appId: z.string(),
    }),
  ),
});

type WindowsSessionStore = z.infer<typeof WindowsSessionSchema>;

@Injectable({
  providedIn: 'root',
})
export class WindowsSessionService {
  private readonly _storageKey = 'windows-session';
  private readonly _version = 1;
  private readonly _store: WindowsSessionStore;

  constructor() {
    this._store = this.loadStore();
  }

  getSession(): Array<{ id: string; appId: string }> {
    return Object.values(this._store.windows);
  }

  saveSession(windows: Record<WindowId, Window>) {
    this._store.windows = Object.fromEntries(
      Object.entries(windows).map(([windowId, window]) => [
        windowId,
        {
          id: window.id,
          appId: window.appId,
        },
      ]),
    );
    localStorage.setItem(this._storageKey, JSON.stringify(this._store));
  }

  private loadStore(): WindowsSessionStore {
    const defaultStore: WindowsSessionStore = {
      windows: {},
      version: this._version,
    };
    try {
      const stringStore = localStorage.getItem(this._storageKey);
      if (!stringStore) return defaultStore;
      const parsedStore = JSON.parse(stringStore);
      return WindowsSessionSchema.parse(parsedStore);
    } catch {
      localStorage.removeItem(this._storageKey);
      return defaultStore;
    }
  }
}
