import { Injectable } from '@angular/core';
import { ApplicationId, ApplicationSize } from '~/shared/types/application';

@Injectable({
  providedIn: 'root',
})
export class ApplicationSizeService {
  private readonly _storageKey = 'application-sizes';
  private readonly _applicationSizes: Record<ApplicationId, ApplicationSize>;

  constructor() {
    try {
      this._applicationSizes = JSON.parse(localStorage.getItem(this._storageKey) || '{}');
    } catch {
      this._applicationSizes = {};
      localStorage.setItem(this._storageKey, '{}');
    }
  }

  getApplicationSize(appId: ApplicationId, defaultSize: ApplicationSize): ApplicationSize {
    const size = this._applicationSizes[appId];
    if (!size) {
      return defaultSize;
    }
    return size;
  }

  setApplicationSize(appId: ApplicationId, size: ApplicationSize) {
    this._applicationSizes[appId] = {
      height: size.height,
      width: size.width,
    };
    localStorage.setItem(this._storageKey, JSON.stringify(this._applicationSizes));
  }
}
