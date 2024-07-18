import { Component, inject } from '@angular/core';
import { DialogLayoutComponent } from '../../../../layouts';
import { AsyncPipe } from '@angular/common';
import { MatProgressBar } from '@angular/material/progress-bar';
import { ScanService } from '../../../../../../core/services';

@Component({
  selector: 'feature-scan-progress-dialog',
  standalone: true,
  imports: [DialogLayoutComponent, AsyncPipe, MatProgressBar],
  templateUrl: './scan-progress-dialog.component.html',
  styleUrl: './scan-progress-dialog.component.scss',
})
export class ScanProgressDialogComponent {
  public scan = inject(ScanService);
}
