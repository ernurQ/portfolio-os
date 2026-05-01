import { Component } from '@angular/core';
import { WindowsManager } from '~/widgets/windows-manager';
import { Dock } from '~/widgets/dock/dock';
import { Desktop } from '~/widgets/desktop/desktop';

@Component({
  selector: 'app-root',
  imports: [WindowsManager, Dock, Desktop],
  template: `<app-desktop /> <app-windows-manager /> <app-dock />`,
})
export class App {}
