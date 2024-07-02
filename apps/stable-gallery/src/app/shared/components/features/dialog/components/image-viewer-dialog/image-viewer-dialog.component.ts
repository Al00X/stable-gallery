import {AfterViewInit, Component, signal} from '@angular/core';
import {ImageItem} from "../../../../../../core/helpers";
import {BaseDialogComponent} from "../_base-dialog.component";
import {PanZoomComponent, PanZoomConfig} from "ngx-panzoom";
import {ItemRecord} from "../../../../../../core/interfaces";
import {formatDate} from "@angular/common";

export interface ImageViewerDialogData {
  image: ImageItem;
}
export type ImageViewerDialogResult = boolean;

@Component({
  selector: 'feature-image-viewer-dialog',
  standalone: true,
  imports: [PanZoomComponent],
  templateUrl: './image-viewer-dialog.component.html',
  styleUrl: './image-viewer-dialog.component.scss',
})
export class ImageViewerDialogComponent
  extends BaseDialogComponent<ImageViewerDialogData, ImageViewerDialogResult>
  implements AfterViewInit
{
  panZoom = new PanZoomConfig({
    zoomLevels: 20,
    scalePerZoomLevel: 1.3,
    zoomStepDuration: 0.05,
    friction: 50,
    invertMouseWheel: true,
    freeMouseWheel: false,
  });

  private _mouseDownEvent?: MouseEvent;

  isDetailsOpen = signal(false);
  detailsSection = signal<{
    main: ItemRecord<string | number | undefined>[];
    other: ItemRecord<string | number | undefined>[];
    metadata: ItemRecord<string | number | undefined>[];
  } | undefined>(undefined);

  constructor() {
    super();
    const image = this.data.image;
    this.detailsSection.set({
      main: [
        { label: 'Prompt', value: image.prompt },
        { label: 'Negative Prompt', value: image.negativePrompt },
      ],
      other: [
        { label: 'Seed', value: image.seed },
        { label: 'Sampler', value: image.sampler },
        { label: 'Steps', value: image.steps },
        { label: 'CFG', value: image.cfgScale },
        { label: 'Clip Skip', value: image.clipSkip },
        { label: 'Model Hash', value: image.modelHash },
      ],
      metadata: [
        { label: 'Size', value: `${image.width} x ${image.height}` },
        { label: 'Created At', value: formatDate(image.createdAt, 'yyyy/MM/dd', 'en') },
        { label: 'Updated At', value: image.updatedAt ? formatDate(image.updatedAt, 'yyyy/MM/dd', 'en') : undefined },
      ]
    })
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();
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
}
