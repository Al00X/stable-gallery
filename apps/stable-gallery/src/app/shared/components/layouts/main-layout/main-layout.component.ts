import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterOutlet} from "@angular/router";
import {AppService, ImagesService} from "../../../../core/services";
import {ToggleComponent} from "../../ui";
import {formControl} from "../../../../core/helpers";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToggleComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  public readonly imageService = inject(ImagesService);
  private readonly app = inject(AppService);

  nsfwControl = formControl(this.app.state.settings.showNsfw);

  constructor() {
    this.nsfwControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(v => {
      this.app.setSettings({
        showNsfw: v,
      })
    })
  }
}
