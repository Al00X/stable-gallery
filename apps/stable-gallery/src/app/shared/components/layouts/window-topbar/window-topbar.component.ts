import { Component, inject } from '@angular/core';
import { ButtonComponent, IconComponent, ToggleComponent } from '../../ui';
import { AppService, ElectronService } from '../../../../core/services';
import { formControl } from '../../../../core/helpers';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-window-topbar',
  standalone: true,
  imports: [IconComponent, ToggleComponent, ButtonComponent],
  templateUrl: './window-topbar.component.html',
  styleUrl: './window-topbar.component.scss',
})
export class WindowTopbarComponent {
  public readonly electron = inject(ElectronService);
  private readonly app = inject(AppService);

  nsfwControl = formControl(this.app.state.settings.showNsfw);

  constructor() {
    this.nsfwControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((v) => {
      this.app.setSettings({
        showNsfw: v,
      });
    });
  }

  openChangelog() {
    dialog$.changelog();
  }

  openSettings() {
    dialog$.settings({});
  }

  onWindowState(state: 'close' | 'maximize' | 'minimize') {
    this.electron.setWindow(state);
  }
}
