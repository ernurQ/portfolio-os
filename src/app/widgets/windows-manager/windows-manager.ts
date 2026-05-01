import { Component, inject } from '@angular/core';
import { WindowWrapper } from './ui/window-wrapper/window-wrapper';
import { WindowsService } from '~/services/windows-service';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { WindowId } from '~/shared/types/window';
import { ApplicationId } from '~/shared/types/application';
import { ApplicationPositionService } from '~/services/application-position-service';

@Component({
  selector: 'app-windows-manager',
  standalone: true,
  imports: [WindowWrapper, CdkDrag],
  template: `
    <div>
      @for (win of windows(); track win.id) {
        <app-window-wrapper
          [windowId]="win.id"
          [appId]="win.appId"
          [initialSize]="win.initialSize"
          [style.z-index]="win.zIndex"
          cdkDrag
          [cdkDragFreeDragPosition]="win.initialPosition"
          (cdkDragEnded)="onDragEnded($event, win.appId)"
          (closed)="close(win.id)"
          (mousedown)="onMouseDown(win.id)"
        />
      }
    </div>
  `,
})
export class WindowsManager {
  private readonly windowsService = inject(WindowsService);
  private readonly applicationPositionService = inject(ApplicationPositionService);

  readonly windows = this.windowsService.windowsList;

  close(id: WindowId) {
    this.windowsService.closeWindow(id);
  }

  onMouseDown(windowId: WindowId) {
    this.windowsService.focusWindow(windowId);
  }

  onDragEnded(event: CdkDragEnd, appId: ApplicationId) {
    const newPosition = event.source.getFreeDragPosition();
    this.applicationPositionService.setApplicationPosition(appId, newPosition);
  }
}
