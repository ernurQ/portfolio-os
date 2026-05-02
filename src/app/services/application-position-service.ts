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

  getApplicationPosition(
    appId: ApplicationId,
    appSize: ApplicationSize,
    offset: number = 0,
  ): ApplicationPosition {
    const position = this._applicationPositions[appId];

    const maxX = window.innerWidth - appSize.width;
    const maxY = window.innerHeight - appSize.height;

    let targetX = 0;
    let targetY = 0;

    if (!position) {
      targetX = (window.innerWidth - appSize.width) / 2;
      targetY = (window.innerHeight - appSize.height) / 2;
    } else {
      targetX = position.x;
      targetY = position.y;
    }

    return {
      x: Math.max(0, Math.min(targetX + offset, maxX)),
      y: Math.max(0, Math.min(targetY + offset, maxY)),
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
