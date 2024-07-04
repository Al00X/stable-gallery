import {Component, ViewChild} from '@angular/core';
import {BaseDialogComponent} from "../_base-dialog.component";
import {DialogLayoutComponent} from "../../../../layouts";
import {ButtonComponent, ListFieldComponent} from "../../../../ui";
import {SettingsFormComponent} from "../../../settings-form/settings-form.component";

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
  @ViewChild('SettingForm') settingForm!: SettingsFormComponent;

  onSave() {
    this.close(this.settingForm.save());
  }
}
