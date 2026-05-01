import { Injectable } from '@angular/core';
import { ApplicationId, ApplicationPosition, ApplicationSize } from '~/shared/types/application';

@Injectable({
  providedIn: 'root',
})
export class ApplicationPositionService {
  private readonly _storageKey = 'application-positions';
  private readonly _applicationPositions: Record<ApplicationId, ApplicationPosition | undefined>;

  constructor() {
    const storedData = localStorage.getItem(this._storageKey);
    try {
      this._applicationPositions = JSON.parse(storedData || '{}');
    } catch {
      this._applicationPositions = {};
      localStorage.setItem(this._storageKey, '{}');
    }
  }

  getApplicationPosition(appId: ApplicationId, appSize: ApplicationSize): ApplicationPosition {
    const position = this._applicationPositions[appId];

    if (!position) {
      return {
        x: Math.max(0, (window.innerWidth - appSize.width) / 2),
        y: Math.max(0, (window.innerHeight - appSize.height) / 2),
      };
    }

    const maxX = window.innerWidth - appSize.width;
    const maxY = window.innerHeight - appSize.height;

    return {
      x: Math.max(0, Math.min(position.x, maxX)),
      y: Math.max(0, Math.min(position.y, maxY)),
    };
  }

  setApplicationPosition(appId: ApplicationId, position: ApplicationPosition) {
    this._applicationPositions[appId] = {
      x: position.x,
      y: position.y,
    };
    localStorage.setItem(this._storageKey, JSON.stringify(this._applicationPositions));
  }
}
