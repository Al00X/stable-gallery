import { Injectable } from '@angular/core';
import { DialogInvokerService } from './dialog-invoker.service';
import {
  PromptDialogComponent,
  PromptDialogData,
  PromptDialogResult
} from "./components/prompt-dialog/prompt-dialog.component";
import {
  ImageViewerDialogComponent,
  ImageViewerDialogData, ImageViewerDialogResult
} from "./components/image-viewer-dialog/image-viewer-dialog.component";

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: DialogInvokerService) {}

  prompt(data: PromptDialogData) {
    return this.dialog.open<PromptDialogComponent, PromptDialogData, PromptDialogResult>(PromptDialogComponent, data, {
      width: '85vw',
      maxWidth: '46rem',
    });
  }

  imageViewer(data: ImageViewerDialogData) {
    return this.dialog.open<ImageViewerDialogComponent, ImageViewerDialogData, ImageViewerDialogResult>(ImageViewerDialogComponent, data, {
      width: '100%',
      height: '100%',
      maxWidth: '100vw',
      maxHeight: '100vh'
    })
  }
}
