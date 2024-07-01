import {Component, inject, signal} from '@angular/core';
import {RouterModule} from '@angular/router';
import {AsyncPipe} from "@angular/common";
import {debounceTime} from "rxjs";
import {AppService, ImagesService} from "./core/services";
import {DbService} from "./core/db";
import {ImageItem} from "./core/helpers";

@Component({
  standalone: true,
  imports: [RouterModule, AsyncPipe],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly app = inject(AppService);
  public readonly imageService = inject(ImagesService);
  private readonly db = inject(DbService);

  items = signal<ImageItem[]>([]);

  constructor() {
    setTimeout(() => {
      this.app.setDirs([
        'E:/sources/automatic1111-sd-webui/outputs/extras-images',
        'D:/Dreams',
      ])
      this.imageService.startScan();
    }, 1000)

    this.db.initialized$.subscribe(() => {
      this.get()
    })
    this.imageService.newItemScanned$.pipe(debounceTime(2000)).subscribe(async () => {
      this.get();
    })
  }

  private async get() {
    if (!this.db.initialized$.value) return;
    this.items.set(await this.db.getImages({
      perPage: 100
    }));
  }
}
