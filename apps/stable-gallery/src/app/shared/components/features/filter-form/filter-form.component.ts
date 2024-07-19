import { Component } from '@angular/core';
import {FieldComponent, NumericRangeComponent} from "../../ui";
import {extractNonEmptyEntries, formatMinMax, formControl, formGroup} from "../../../../core/helpers";
import {ItemRecord, MinMax} from "../../../../core/interfaces";
import {ImageQueryModel} from "../../../../core/db";
import {BehaviorSubject} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'feature-filter-form',
  standalone: true,
  imports: [FieldComponent, NumericRangeComponent],
  templateUrl: './filter-form.component.html',
  styleUrl: './filter-form.component.scss',
})
export class FilterFormComponent {
  filterDictionary = {
    prompt: 'Prompt',
    negativePrompt: 'Negative Prompt',
    sampler: 'Sampler',
    cfg: 'CFG Scale',
    steps: 'Steps',
  } as const

  filterGroup = formGroup({
    prompt: formControl(''),
    negativePrompt: formControl(''),
    sampler: formControl(''),
    cfg: formControl<MinMax>(),
    steps: formControl<MinMax>(),
  });

  activeItems$ = new BehaviorSubject<ItemRecord<any>[]>([])

  constructor() {
    this.filterGroup.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.activeItems$.next(this.getActiveItems())
    })
  }

  getModel(): ImageQueryModel {
    return this.filterGroup.value;
  }

  reset() {
    this.filterGroup.reset();
  }

  resetSingle(key: keyof ImageQueryModel) {
    // @ts-ignore
    this.filterGroup.controls[key as any]?.reset();
  }

  getActiveItems() {
    const model = this.getModel();
    const filtered = extractNonEmptyEntries(model);
    return Object.entries(filtered).map(([key, value]) => {
      const formatted = key === 'cfg' || key === 'steps' ? formatMinMax(value as any) : value
      return {
        key,
        value,
        label: `${this.filterDictionary[key as keyof typeof this.filterDictionary]}: ${formatted}`,
      }
    })
  }
}
