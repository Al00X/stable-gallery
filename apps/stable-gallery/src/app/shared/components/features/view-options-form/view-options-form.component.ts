import {Component, inject} from '@angular/core';
import {ButtonGroupComponent, FieldComponent, SliderComponent} from "../../ui";
import {formControl} from "../../../../core/helpers";
import {AppService} from "../../../../core/services";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {combineLatest} from "rxjs";
import {AsyncPipe, NgIf} from "@angular/common";

@Component({
  selector: 'feature-view-options-form',
  standalone: true,
  imports: [
    ButtonGroupComponent,
    SliderComponent,
    FieldComponent,
    AsyncPipe,
    NgIf,
  ],
  templateUrl: './view-options-form.component.html',
  styleUrl: './view-options-form.component.scss',
})
export class ViewOptionsFormComponent {
  public readonly app = inject(AppService);

  viewStyleControl = formControl(this.app.state.settings.galleryViewStyle);
  itemPerRowControl = formControl(this.app.state.settings.galleryItemPerRow);
  columnsControl = formControl(this.app.state.settings.galleryColumns);
  itemSizeControl = formControl(this.app.state.settings.galleryItemAspectRatio);
  itemGapControl = formControl(this.app.state.settings.galleryItemGap);

  constructor() {
    combineLatest({
      viewStyle: this.viewStyleControl.value$,
      itemPerRow: this.itemPerRowControl.value$,
      columns: this.columnsControl.value$,
      itemSize: this.itemSizeControl.value$,
      itemGap: this.itemGapControl.value$,
    })
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (v) => {
          this.app.setSettings({
            galleryViewStyle: v.viewStyle,
            galleryItemPerRow: v.itemPerRow,
            galleryColumns: v.columns,
            galleryItemAspectRatio: v.itemSize,
            galleryItemGap: v.itemGap,
          });
        },
      });
  }
}
