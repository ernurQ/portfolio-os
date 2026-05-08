import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ApplicationId } from '~/shared/types/application';
import { Window, WindowId } from '~/shared/types/window';
import { ApplicationsService } from '~/services/applications-service';
import { ApplicationPositionService } from '~/services/application-position-service';
import { ApplicationSizeService } from '~/services/application-size-service';
import { WindowsSessionService } from '~/services/windows-session-service';
import { WindowsPositionService } from '~/services/windows-position-service';

@Injectable({ providedIn: 'root' })
export class WindowsService {
  private readonly windowsSessionService = inject(WindowsSessionService);
  private readonly windowPositionService = inject(WindowsPositionService);
  private readonly applicationsService = inject(ApplicationsService);
  private readonly applicationSizeService = inject(ApplicationSizeService);
  private readonly applicationPositionService = inject(
    ApplicationPositionService,
  );

  private readonly _openedWindows = signal<Record<WindowId, Window>>({});
  private _currentMaxZIndex = 100;

  constructor() {
    const savedWindows = this.windowsSessionService.getSession();
    savedWindows.forEach((window) => {
      this.openWindow(window.appId, {
        windowId: window.id,
      });
    });

    effect(() => {
      const windows = this._openedWindows();
      this.windowsSessionService.saveSession(windows);
    });
  }

  public readonly windowsList = computed(() =>
    Object.values(this._openedWindows()),
  );
  public readonly openedAppsIdsSet = computed(() => {
    return new Set(this.windowsList().map((w) => w.appId));
  });

  openWindow(appId: ApplicationId, options: { windowId?: WindowId } = {}) {
    const app = this.applicationsService.getApplicationById(appId);

    const openedAppInstances = this.windowsList().filter(
      (w) => w.appId === appId,
    );
    if (openedAppInstances.length >= app.options.maxInstances) {
      const topAppInstance = openedAppInstances.reduce((prev, current) =>
        prev.zIndex > current.zIndex ? prev : current,
      );
      this.focusWindow(topAppInstance.id);
      return;
    }

    const initialSize = this.applicationSizeService.getApplicationSize(
      appId,
    ) || {
      width: app.options.defaultWidth,
      height: app.options.defaultHeight,
    };

    const initialPosition = options.windowId
      ? this.windowPositionService.getWindowPosition(options.windowId)
      : this.applicationPositionService.getApplicationPosition(
          appId,
          initialSize,
          openedAppInstances.length * 10,
        );

    const newWindow: Window = {
      id: options.windowId || crypto.randomUUID(),
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
