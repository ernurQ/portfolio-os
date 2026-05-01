import { Component, inject } from '@angular/core';
import { ApplicationsService } from '~/services/applications-service';
import { WindowsService } from '~/services/windows-service';
import { ApplicationId } from '~/shared/types/application';

@Component({
  selector: 'app-dock',
  imports: [],
  templateUrl: './dock.html',
})
export class Dock {
  private applicationsService = inject(ApplicationsService);
  private windowsService = inject(WindowsService);

  readonly appsList = this.applicationsService.pinnedInDockApplications;
  readonly openedApps = this.windowsService.openedAppsIdsSet;

  openApp(appId: ApplicationId) {
    this.windowsService.openWindow(appId);
  }
}
