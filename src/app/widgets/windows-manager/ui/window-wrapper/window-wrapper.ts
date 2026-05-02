import { Component, inject, input, OnInit, output, signal, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';

import { Application, ApplicationId, ApplicationSize } from '~/shared/types/application';
import { ApplicationsService } from '~/services/applications-service';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { WindowId } from '~/shared/types/window';
import { ApplicationSizeService } from '~/services/application-size-service';

@Component({
  selector: 'app-window-wrapper',
  imports: [NgComponentOutlet, CdkDragHandle],
  templateUrl: './window-wrapper.html',
  host: {
    '[style.min-width.px]': 'app.options.minWidth',
    '[style.min-height.px]': 'app.options.minHeight',
    '[style.width.px]': 'width()',
    '[style.height.px]': 'height()',
  },
})
export class WindowWrapper implements OnInit {
  private readonly appsService = inject(ApplicationsService);
  private readonly appSizeService = inject(ApplicationSizeService);

  windowId = input.required<WindowId>();
  appId = input.required<ApplicationId>();
  initialSize = input.required<ApplicationSize>();

  app!: Application;

  appComponent = signal<Type<any> | null>(null);
  isAppComponentPending = signal<boolean>(true);
  isAppComponentError = signal<boolean>(false);

  width = signal(0);
  height = signal(0);

  ngOnInit() {
    this.app = this.appsService.getApplicationById(this.appId());
    this.width.set(this.initialSize().width);
    this.height.set(this.initialSize().height);
    void this.loadAppComponent();
  }

  private async loadAppComponent() {
    this.isAppComponentPending.set(true);
    this.isAppComponentError.set(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const component = await this.app.loadComponent();
      this.appComponent.set(component);
    } catch (error) {
      this.isAppComponentError.set(true);
    } finally {
      this.isAppComponentPending.set(false);
    }
  }

  closed = output<void>();
  onClose() {
    this.closed.emit();
  }

  initResize(e: MouseEvent) {
    if (!this.app.options.isResizable) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = this.width();
    const startHeight = this.height();

    const minW = this.app.options.minWidth;
    const minH = this.app.options.minHeight;
    const preserveRatio = this.app.options.preserveAspectRatio;
    const aspectRatio = startWidth / startHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth + deltaX;
      let newHeight = startHeight + deltaY;

      if (preserveRatio) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }

        if (newWidth < minW || newHeight < minH) {
          if (minW / aspectRatio > minH) {
            newWidth = minW;
            newHeight = newWidth / aspectRatio;
          } else {
            newHeight = minH;
            newWidth = newHeight * aspectRatio;
          }
        }

        this.width.set(newWidth);
        this.height.set(newHeight);
      } else {
        if (newWidth >= minW) this.width.set(newWidth);
        if (newHeight >= minH) this.height.set(newHeight);
      }
    };

    const onMouseUp = () => {
      this.appSizeService.setApplicationSize(this.appId(), {
        width: this.width(),
        height: this.height(),
      });

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
}
