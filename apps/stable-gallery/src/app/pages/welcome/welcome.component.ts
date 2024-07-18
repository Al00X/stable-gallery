import { Component, inject, ViewChild } from '@angular/core';
import { SettingsFormComponent } from '../../shared/components/features/settings-form/settings-form.component';
import { ButtonComponent } from '../../shared/components/ui';
import { Router } from '@angular/router';
import { ScanService } from '../../core/services';
import { take } from 'rxjs';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [SettingsFormComponent, ButtonComponent],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
})
export class WelcomeComponent {
  private router = inject(Router);
  private scan = inject(ScanService);

  @ViewChild('SettingsForm') settingsForm!: SettingsFormComponent;

  onSave() {
    if (this.settingsForm.save()) {
      this.scan.startScan();
      const dialog = dialog$.scanProgress();
      this.scan.progressCompleted$.pipe(take(1)).subscribe(() => {
        dialog.close();
        this.router.navigate(['/']);
      });
    } else {
      // show a red ass error or something
    }
  }
}
