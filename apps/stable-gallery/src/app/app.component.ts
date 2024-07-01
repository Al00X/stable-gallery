import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterModule} from '@angular/router';
import {AsyncPipe} from "@angular/common";
import {AppService, ImagesService} from "./core/services";

@Component({
  standalone: true,
  imports: [RouterModule, AsyncPipe],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly app = inject(AppService);
  public readonly imageService = inject(ImagesService);

  constructor() {
    setTimeout(async () => {
      this.app.setSettings({
        dirs: [
          // 'E:/sources/automatic1111-sd-webui/outputs/extras-images',
          'D:/Dreams',
        ]
      })
      console.time('exist')
      await this.imageService.checkExistence();
      console.timeEnd('exist')
      this.imageService.startScan();
    }, 1000)
  }
}
