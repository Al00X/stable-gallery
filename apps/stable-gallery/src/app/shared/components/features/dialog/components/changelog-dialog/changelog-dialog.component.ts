import {AfterViewInit, Component, inject, signal} from '@angular/core';
import {ElectronService} from "../../../../../../core/services";
import {BaseDialogComponent} from "../_base-dialog.component";
import {DialogLayoutComponent} from "../../../../layouts";
import {marked} from "marked";

@Component({
  selector: 'feature-changelog-dialog',
  standalone: true,
  imports: [DialogLayoutComponent],
  templateUrl: './changelog-dialog.component.html',
  styleUrl: './changelog-dialog.component.scss',
})
export class ChangelogDialogComponent
  extends BaseDialogComponent<any, any>
  implements AfterViewInit
{
  public electron = inject(ElectronService);

  html = signal('');

  constructor() {
    super();
    this.html.set(marked(this.electron.changelogMd) as string);
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();
    // this.cdr.detectChanges()
  }
}
