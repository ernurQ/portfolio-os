import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ApplicationId } from '~/shared/types/application';
import { Window, WindowId } from '~/shared/types/window';
import { ApplicationsService } from '~/services/applications-service';
import { ApplicationPositionService } from '~/services/application-position-service';
import { ApplicationSizeService } from '~/services/application-size-service';
import { WindowsSessionService } from '~/services/windows-session-service';

@Injectable({ providedIn: 'root' })
export class WindowsService {
  private readonly windowsSessionService = inject(WindowsSessionService);
  private readonly applicationsService = inject(ApplicationsService);
  private readonly applicationSizeService = inject(ApplicationSizeService);
  private readonly applicationPositionService = inject(ApplicationPositionService);

  private readonly _openedWindows = signal<Record<WindowId, Window | undefined>>({});
  private _currentMaxZIndex = 100;

  constructor() {
    const savedSessionAppIds = this.windowsSessionService.restoreSession();

    savedSessionAppIds.forEach((appId) => {
      try {
        this.openWindow(appId);
      } catch (e) {
        console.warn(`Не удалось восстановить приложение: ${appId}`);
      }
    });

    effect(() => {
      const windows = this.windowsList();
      if (windows.length === 0) {
        this.windowsSessionService.saveSession([]);
        return;
      }
      const sortedWindows = [...windows].sort((a, b) => a.zIndex - b.zIndex);
      const appIdsToSave = sortedWindows.map((w) => w.appId);
      this.windowsSessionService.saveSession(appIdsToSave);
    });
  }

  public readonly windowsList = computed(() =>
    Object.values(this._openedWindows()).filter((w): w is Window => !!w),
  );
  public readonly openedAppsIdsSet = computed(() => {
    return new Set(this.windowsList().map((w) => w.appId));
  });

  openWindow(appId: ApplicationId) {
    const app = this.applicationsService.getApplicationById(appId);

    const openedAppInstances = this.windowsList().filter((w) => w.appId === appId);
    if (openedAppInstances.length >= app.options.maxInstances) {
      const topAppInstance = openedAppInstances.reduce((prev, current) =>
        prev.zIndex > current.zIndex ? prev : current,
      );
      this.focusWindow(topAppInstance.id);
      return;
    }

    const initialSize = this.applicationSizeService.getApplicationSize(appId, {
      width: app.options.defaultWidth,
      height: app.options.defaultHeight,
    });

    const offset = openedAppInstances.length * 10;
    const initialPosition = this.applicationPositionService.getApplicationPosition(
      appId,
      initialSize,
      offset,
    );

    const newWindow: Window = {
      id: crypto.randomUUID(),
      appId,
      zIndex: ++this._currentMaxZIndex,
      initialSize,
      initialPosition,
    };

    this._openedWindows.update((state) => ({
      ...state,
      [newWindow.id]: newWindow,
    }));
  }

  closeWindow(windowId: WindowId) {
    this._openedWindows.update(({ [windowId]: _, ...rest }) => rest);
  }

  focusWindow(windowId: WindowId) {
    this._openedWindows.update((state) => {
      const window = state[windowId];
      if (!window || window.zIndex === this._currentMaxZIndex) return state;

      return {
        ...state,
        [windowId]: {
          ...window,
          zIndex: ++this._currentMaxZIndex,
        },
      };
    });
  }
}
