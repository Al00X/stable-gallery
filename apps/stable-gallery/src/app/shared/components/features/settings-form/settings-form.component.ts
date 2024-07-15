import {Component, inject, Input, ViewChild} from '@angular/core';
import {ListFieldAddEvent, ListFieldComponent, ToggleComponent} from "../../ui";
import {AppService, ElectronService} from "../../../../core/services";
import {formControl, formGroup} from "../../../../core/helpers";

@Component({
  selector: 'feature-settings-form',
  standalone: true,
  imports: [ListFieldComponent, ToggleComponent],
  templateUrl: './settings-form.component.html',
  styleUrl: './settings-form.component.scss',
})
export class SettingsFormComponent {
  private app = inject(AppService);
  private electron = inject(ElectronService);

  @ViewChild('DirsListField')
  dirsListFieldComponent!: ListFieldComponent<string>;

  @Input() showOptionals = false;

  private _isBrowsing = false;

  settingsForm = formGroup({
    dirs: formControl<string[]>(),
    openDetailsInGalleryByDefault: formControl<boolean>(),
    openDetailsInLightboxByDefault: formControl<boolean>(),
    peakNsfw: formControl<boolean>(),
    showSampler: formControl<boolean>(),
  })

  constructor() {
    const settings = this.app.state.settings;
    this.settingsForm.patchValue({
      dirs: settings.dirs,
      openDetailsInGalleryByDefault: settings.openDetailsTabInGalleryByDefault,
      openDetailsInLightboxByDefault: settings.openDetailsTabInLightboxByDefault,
      peakNsfw: !!settings.peakNsfwWithKeybinding,
      showSampler: !!settings.showSamplerInGallery
    })
  }

  onAddToDirs(e: ListFieldAddEvent<string>) {
    if (this._isBrowsing) return;
    this._isBrowsing = true;
    this.electron.openDirectorySelectDialog().then((res) => {
      this._isBrowsing = false;
      if (!res) return;
      e.addToList(res);
    });
  }

  // returns the validity of settings
  save() {
    const values = this.settingsForm.value;
    this.app.setSettings({
      dirs: values.dirs,
      openDetailsTabInGalleryByDefault: values.openDetailsInGalleryByDefault,
      openDetailsTabInLightboxByDefault: values.openDetailsInLightboxByDefault,
      peakNsfwWithKeybinding: values.peakNsfw ? 'Alt' : undefined,
      showSamplerInGallery: values.showSampler
    });

    return this.app.isSettingsValid();
  }
}
