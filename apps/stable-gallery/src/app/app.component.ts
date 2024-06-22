import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FilesService} from "./services/files.service";
import {DbService} from "./services/db.service";
import {ImageItem} from "./helpers/image.helper";

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly fileService = inject(FilesService);
  private readonly dbService = inject(DbService);

  test = signal('');

  constructor() {
    this.fileService.scan('E:/sources/automatic1111-sd-webui/outputs/extras-images').then(t => {
      this.test.set(t[10]);
      console.log(this.test())
    })
    this.fileService.watch('E:/sources/automatic1111-sd-webui/outputs/extras-images').state.subscribe((r) => {
      console.log(r)
    })
    console.log(this.dbService.db)
    const img = new ImageItem('E:/sources/automatic1111-sd-webui/outputs/extras-images/00013.png');
    img.load().then(r => {
      console.log(img)
    })
  }
}
