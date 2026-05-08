import { Injectable } from '@angular/core';
import { ApplicationId, ApplicationSize } from '~/shared/types/application';
import { z } from 'zod';

const ApplicationSizeSchema = z.object({
  applications: z.record(
    z.string(),
    z.object({
      width: z.number(),
      height: z.number(),
    }),
  ),
  version: z.number(),
});

type ApplicationSizeStore = z.infer<typeof ApplicationSizeSchema>;

@Injectable({
  providedIn: 'root',
})
export class ApplicationSizeService {
  private readonly _storageKey = 'application-sizes';
  private readonly _version = 1;
  private readonly _store: ApplicationSizeStore;

  constructor() {
    this._store = this.loadStore();
  }

  getApplicationSize(appId: ApplicationId): ApplicationSize | null {
    return this._store.applications[appId] || null;
  }

  setApplicationSize(appId: ApplicationId, size: ApplicationSize): void {
    this._store.applications[appId] = {
      height: size.height,
      width: size.width,
    };
    localStorage.setItem(this._storageKey, JSON.stringify(this._store));
  }

  private loadStore(): ApplicationSizeStore {
    const defaultStore: ApplicationSizeStore = {
      applications: {},
      version: this._version,
    };
    try {
      const storeString = localStorage.getItem(this._storageKey);
      if (!storeString) return defaultStore;
      const parsedStore = JSON.parse(storeString);
      return ApplicationSizeSchema.parse(parsedStore);
    } catch {
      localStorage.removeItem(this._storageKey);
      return defaultStore;
    }
  }
}
