import {Component, inject, ViewChild} from '@angular/core';
import { BaseDialogComponent } from '../_base-dialog.component';
import { DialogLayoutComponent } from '../../../../layouts';
import {ButtonClickEvent, ButtonComponent, ListFieldComponent} from '../../../../ui';
import { SettingsFormComponent } from '../../../settings-form/settings-form.component';
import {AppService} from "../../../../../../core/services";
import {CacheService} from "../../../../../../core/services";
import {Router} from "@angular/router";

export type SettingsDialogData = {} | undefined;

export type SettingsDialogResult = boolean;

@Component({
  selector: 'feature-settings-dialog',
  standalone: true,
  imports: [
    DialogLayoutComponent,
    ListFieldComponent,
    ButtonComponent,
    SettingsFormComponent,
  ],
  templateUrl: './settings-dialog.component.html',
  styleUrl: './settings-dialog.component.scss',
})
export class SettingsDialogComponent extends BaseDialogComponent<
  SettingsDialogData,
  SettingsDialogResult
> {
  private app = inject(AppService);
  private cache = inject(CacheService);
  private router = inject(Router);

  @ViewChild('SettingForm') settingForm!: SettingsFormComponent;

  onSave() {
    this.close(this.settingForm.save());
  }

  onResetSettings() {
    dialog$.prompt({
      title: 'You are going to reset your settings!',
      message:
        'Resetting will set the customized settings the default values.\nAre you sure you want to continue?',
      yesButtonClassList: 'bg-transparent border border-error-600 text-error-600',
      yesButtonText: 'Reset',
      noButtonText: 'Nope',
    }).afterSubmit().subscribe(() => {
      this.resetSettings();
      this.close();
    })
  }

  onResetData(e: ButtonClickEvent) {
    dialog$.prompt({
      title: 'You are going to reset your data!',
      message:
        'Resetting will delete index database (indexed images) and cache.\nAre you sure you want to continue?',
      yesButtonClassList: 'bg-transparent border border-error-600 text-error-600',
      yesButtonText: 'Reset',
      noButtonText: 'Nope',
    }).afterSubmit().subscribe(async () => {
      e.setLoading(true);
      await this.resetData();
      this.close();
    })
  }

  onResetAll(e: ButtonClickEvent) {
    dialog$.prompt({
      title: 'You are going to reset everything!',
      message:
        'Resetting will delete index database (indexed images), cache and customized setting and you will redirected back to the welcome page.\nAre you sure you want to continue?',
      yesButtonClassList: 'bg-transparent border border-error-600 text-error-600',
      yesButtonText: 'Reset',
      noButtonText: 'Nope',
    }).afterSubmit().subscribe(async () => {
      e.setLoading(true);
      await this.resetData();
      this.resetSettings();
      this.router.navigate(['/welcome']);
      this.close();
    });
  }

  private async resetData() {
    await db$.reset();
    this.cache.reset();
  }

  private resetSettings() {
    const dirs = this.app.state.settings.dirs;
    this.app.reset();
    this.app.setSettings({
      dirs
    })
  }
}
