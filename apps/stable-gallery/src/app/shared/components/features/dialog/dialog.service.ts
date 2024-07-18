import { Injectable } from '@angular/core';
import { DialogInvokerService } from './dialog-invoker.service';
import {
  PromptDialogComponent,
  PromptDialogData,
  PromptDialogResult,
} from './components/prompt-dialog/prompt-dialog.component';
import {
  ImageViewerDialogComponent,
  ImageViewerDialogData,
  ImageViewerDialogResult,
} from './components/image-viewer-dialog/image-viewer-dialog.component';
import {
  SettingsDialogComponent,
  SettingsDialogData,
  SettingsDialogResult,
} from './components/settings-dialog/settings-dialog.component';
import { ScanProgressDialogComponent } from './components/scan-progress-dialog/scan-progress-dialog.component';
import { ChangelogDialogComponent } from './components/changelog-dialog/changelog-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: DialogInvokerService) {}

  prompt(data: PromptDialogData) {
    return this.dialog.open<
      PromptDialogComponent,
      PromptDialogData,
      PromptDialogResult
    >(PromptDialogComponent, data, {
      width: '85vw',
      maxWidth: '46rem',
    });
  }

  imageViewer(data: ImageViewerDialogData) {
    return this.dialog.open<
      ImageViewerDialogComponent,
      ImageViewerDialogData,
      ImageViewerDialogResult
    >(ImageViewerDialogComponent, data, {
      width: '100%',
      height: '100%',
      maxWidth: '100vw',
      maxHeight: '100vh',
    });
  }

  settings(data: SettingsDialogData) {
    return this.dialog.open<
      SettingsDialogComponent,
      SettingsDialogData,
      SettingsDialogResult
    >(SettingsDialogComponent, data, {
      width: '60%',
      height: '80%',
      maxWidth: '1020px',
      maxHeight: '920px',
    });
  }

  scanProgress() {
    return this.dialog.open(ScanProgressDialogComponent, undefined, {
      width: '600px',
      disableClose: true,
    });
  }

  changelog() {
    return this.dialog.open(ChangelogDialogComponent, undefined, {
      minWidth: '300px',
      minHeight: '300px',
    });
  }
}
