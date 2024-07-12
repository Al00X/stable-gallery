import {AfterViewInit, Component, inject, signal} from '@angular/core';
import {ImageItem} from "../../../../../../core/helpers";
import {BaseDialogComponent} from "../_base-dialog.component";
import {PanZoomComponent, PanZoomConfig} from "ngx-panzoom";
import {ButtonClickEvent, ButtonComponent, FavoriteToggleComponent, NsfwToggleComponent} from "../../../../ui";
import {CacheService} from "../../../../../../core/services";
import {AppService, FilesService, ScanService} from "../../../../../../core/services";
import {ImageDetailsPaneComponent} from "../../../image-details-pane/image-details-pane.component";
import {ImageActionsComponent} from "../../../image-actions/image-actions.component";

export interface ImageViewerDialogData {
  image: ImageItem;
  loadFromBuffer?: boolean;
}
export type ImageViewerDialogResult = boolean;

@Component({
  selector: 'feature-image-viewer-dialog',
  standalone: true,
  imports: [
    PanZoomComponent,
    ButtonComponent,
    FavoriteToggleComponent,
    NsfwToggleComponent,
    ImageDetailsPaneComponent,
    ImageActionsComponent,
  ],
  templateUrl: './image-viewer-dialog.component.html',
  styleUrl: './image-viewer-dialog.component.scss',
})
export class ImageViewerDialogComponent
  extends BaseDialogComponent<ImageViewerDialogData, ImageViewerDialogResult>
  implements AfterViewInit
{
  private app = inject(AppService);
  private cache = inject(CacheService);
  private file = inject(FilesService);
  private scan = inject(ScanService);

  panZoom = new PanZoomConfig({
    zoomLevels: 20,
    scalePerZoomLevel: 1.3,
    zoomStepDuration: 0.05,
    friction: 50,
    invertMouseWheel: true,
    freeMouseWheel: false,
  });

  private _mouseDownEvent?: MouseEvent;

  isDetailsOpen = signal(
    this.app.state.settings.openDetailsTabInLightboxByDefault
  );
  path = signal('');

  constructor() {
    super();

    if (!this.data.image.id) {
      this.isDetailsOpen.set(true);
    }
    if (this.data.loadFromBuffer) {
      const blob = this.data.image.blob();
      if (!blob) return;
      this.path.set(URL.createObjectURL(blob));
      // this.data.image.buffer().then(buffer => {
      //   console.log(buffer)
      //   this.path.set(URL.createObjectURL(buffer))
      // })
    } else {
      this.path.set(this.data.image.path);
    }
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();
    if (this.isDetailsOpen()) {
      const api = this.panZoom.api.value;
      api.panDeltaAbsolute(
        {
          x: 200,
          y: 0,
        },
        0.05
      );
    }
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  onMouseDown(e: MouseEvent) {
    this._mouseDownEvent = e;
  }

  onMouseUp(e: MouseEvent) {
    if (!this._mouseDownEvent) return;
    if ((e.target as HTMLElement).tagName === 'IMG') return;
    if (
      e.pageX !== this._mouseDownEvent?.pageX ||
      e.pageY !== this._mouseDownEvent?.pageY
    )
      return;
    this.close();
  }

  async onAddToGallery(e: ButtonClickEvent) {
    e.setLoading(true);
    try {
      const filePath = this.data.image.path;
      const dir = this.app.state.settings.dirs[0];
      this.data.image.path = this.file.copyDraft(filePath, dir);
      const image = await db$.addImageEntry(this.data.image);
      if (!image) throw new Error('Image was undefined!? what?');
      this.cache.addToScanned(image.path);
      if (this.data.image.isInMemory()) {
        await this.file.write(image.path, this.data.image.buffer());
      } else {
        await this.file.copy(filePath, dir);
      }
      this.scan.itemAdded$.next(image);
      this.close(true);
    } catch (error) {
      e.setLoading(false);
      console.error('Failed to add this image to gallery', error);
    }
  }
}
