import {Component, inject} from '@angular/core';
import {GalleryComponent} from "../../shared/components/features";
import {ScanService} from "../../core/services";
import {NgxFileDropModule} from "ngx-file-drop";
import {DropZoneComponent} from "../../shared/components/ui";
import {ImageItem} from "../../core/helpers";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [GalleryComponent, NgxFileDropModule, DropZoneComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private scan = inject(ScanService);

  constructor() {
    this.scan.startScan();
  }

  async onFileDragAndDrop(e: FileList) {
    const file = e?.item(0);
    if (!file) return;
    const image = new ImageItem(file);
    if (!image.isImageValid()) return;
    image.load().then(() => {
      dialog$.imageViewer({ image, loadFromBuffer: true })
    });
  }
}
