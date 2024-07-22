import {Component, inject, signal} from '@angular/core';
import {BaseDialogComponent} from "../_base-dialog.component";
import {FilterGroup} from "../../../../../../core/interfaces";
import {DialogLayoutComponent} from "../../../../layouts";
import {FieldComponent} from "../../../../ui";
import {formControl, formGroup} from "../../../../../../core/helpers";
import {Validators} from "@angular/forms";
import {ImageQueryModel} from "../../../../../../core/db";
import {AppService} from "../../../../../../core/services";

export interface FilterGroupCrudData {
  group?: FilterGroup;
  filters?: ImageQueryModel;
}

export type FilterGroupCrudResult = boolean;

@Component({
  selector: 'app-group-crud-dialog',
  standalone: true,
  imports: [DialogLayoutComponent, FieldComponent],
  templateUrl: './filter-group-crud-dialog.component.html',
  styleUrl: './filter-group-crud-dialog.component.scss',
})
export class FilterGroupCrudDialogComponent extends BaseDialogComponent<
  FilterGroupCrudData,
  FilterGroupCrudResult
> {
  app = inject(AppService);

  isNew = signal(this.data.group === undefined);

  formGroup = formGroup({
    name: formControl('', Validators.required),
    filters: formControl<ImageQueryModel>(undefined, Validators.required),
  })

  constructor() {
    super();
    const filterGroup = this.data.group;
    this.formGroup.patchValue({
      name: filterGroup?.name,
      filters: filterGroup?.filters ?? this.data.filters
    })
  }

  onSubmit() {
    const values = this.formGroup.getRawValue();
    if (this.isNew()) {
      this.app.addFilterGroup({
        name: values.name,
        filters: values.filters,
      })
    } else {
      // ...
    }
    this.close(true);
  }
}
