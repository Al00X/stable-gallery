import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterModule} from '@angular/router';
import {AsyncPipe} from "@angular/common";
import {registerIcons} from "./icons.config";
import {setupGlobalServices} from "./globawls";
import {KeybindService} from "./core/services";

@Component({
  standalone: true,
  imports: [RouterModule, AsyncPipe],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor() {
    setupGlobalServices();
    registerIcons();

    inject(KeybindService);
  }
}
