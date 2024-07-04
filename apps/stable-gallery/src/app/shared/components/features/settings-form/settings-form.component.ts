import {Component, inject, ViewChild} from '@angular/core';
import {ListFieldAddEvent, ListFieldComponent} from "../../ui";
import {AppService, ElectronService} from "../../../../core/services";
import {formControl} from "../../../../core/helpers";

@Component({
  selector: 'feature-settings-form',
  standalone: true,
  imports: [ListFieldComponent],
  templateUrl: './settings-form.component.html',
  styleUrl: './settings-form.component.scss',
})
export class SettingsFormComponent {
  private app = inject(AppService);
  private electron = inject(ElectronService);

  @ViewChild('DirsListField')
  dirsListFieldComponent!: ListFieldComponent<string>;

  private _isBrowsing = false;

  dirsControl = formControl<string[]>();

  constructor() {
    this.dirsControl.setValue(this.app.state.settings.dirs);
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
    this.app.setSettings({
      dirs: this.dirsControl.value
    })

    return this.app.isSettingsValid();
  }
}
