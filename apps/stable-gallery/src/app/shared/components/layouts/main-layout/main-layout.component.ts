import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterOutlet} from "@angular/router";
import {AppService, ElectronService, ScanService} from "../../../../core/services";
import {IconComponent, ToggleComponent} from "../../ui";
import {formControl} from "../../../../core/helpers";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MatProgressBar} from "@angular/material/progress-bar";

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ToggleComponent,
    MatProgressBar,
    IconComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  public readonly scan = inject(ScanService);
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
}
