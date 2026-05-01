import { Injectable } from '@angular/core';
import { ApplicationId } from '~/shared/types/application';

@Injectable({
  providedIn: 'root',
})
export class WindowsSessionService {
  private readonly _storageKey = 'windows-session';

  saveSession(appIds: ApplicationId[]) {
    localStorage.setItem(this._storageKey, JSON.stringify(appIds));
  }

  restoreSession(): ApplicationId[] {
    try {
      return JSON.parse(localStorage.getItem(this._storageKey) || '[]');
    } catch {
      return [];
    }
  }
}
