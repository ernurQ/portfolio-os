import { computed, Injectable, signal } from '@angular/core';
import { Application, ApplicationId } from '~/shared/types/application';
import {
  ApplicationConfig,
  applicationsConfig,
  DEFAULT_APP_OPTIONS,
} from '~/shared/config/applications-config';

@Injectable({
  providedIn: 'root',
})
export class ApplicationsService {
  private readonly _applications = signal<Application[]>(
    applicationsConfig.map((config) => this.normalizeConfig(config)),
  );
  private readonly _applicationsMap = computed(
    () => new Map(this._applications().map((app) => [app.id, app])),
  );

  public readonly pinnedInDockApplications = computed(() =>
    this._applications().filter((app) => app.options.isPinnedInDock),
  );

  public getApplicationById(id: ApplicationId): Application {
    const app = this._applicationsMap().get(id);
    if (!app) {
      throw new Error(`ApplicationsService: app "${id}" not found.`);
    }
    return app;
  }

  private normalizeConfig(appConfig: ApplicationConfig): Application {
    return {
      ...appConfig,
      options: {
        ...DEFAULT_APP_OPTIONS,
        ...(appConfig.options ?? {}),
      },
    };
  }
}
