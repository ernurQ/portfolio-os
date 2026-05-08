import { Component, inject } from '@angular/core';
import { WindowWrapper } from './ui/window-wrapper/window-wrapper';
import { WindowsService } from '~/services/windows-service';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { Window, WindowId } from '~/shared/types/window';
import { ApplicationPositionService } from '~/services/application-position-service';
import { WindowsPositionService } from '~/services/windows-position-service';

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
          (cdkDragEnded)="onDragEnded($event, win)"
          (closed)="close(win.id)"
          (mousedown)="onMouseDown(win.id)"
        />
      }
    </div>
  `,
})
export class WindowsManager {
  private readonly windowsService = inject(WindowsService);
  private readonly windowPositionService = inject(WindowsPositionService);
  private readonly applicationPositionService = inject(
    ApplicationPositionService,
  );

  readonly windows = this.windowsService.windowsList;

  close(id: WindowId) {
    this.windowsService.closeWindow(id);
  }

  onMouseDown(windowId: WindowId) {
    this.windowsService.focusWindow(windowId);
  }

  onDragEnded(event: CdkDragEnd, window: Window) {
    const newPosition = event.source.getFreeDragPosition();
    this.windowPositionService.saveWindowPosition(window.id, newPosition);
    this.applicationPositionService.saveApplicationPosition(
      window.appId,
      newPosition,
    );
  }
}
