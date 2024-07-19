import {Component, Input} from '@angular/core';
import {formControl} from "../../../../core/helpers";
import {LabelComponent} from "../label/label.component";
import {FieldComponent} from "../field/field.component";
import {MinMax} from "../../../../core/interfaces";
import {combineLatest, debounceTime} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'ui-numeric-range',
  standalone: true,
  imports: [LabelComponent, FieldComponent],
  templateUrl: './numeric-range.component.html',
  styleUrl: './numeric-range.component.scss',
})
export class NumericRangeComponent {
  @Input() control = formControl<MinMax>();
  @Input() label?: string;
  @Input() min?: number;
  @Input() max?: number;

  minControl = formControl<string>();
  maxControl = formControl<string>();

  constructor() {
    combineLatest({
      min: this.minControl.value$,
      max: this.maxControl.value$,
    }).pipe(takeUntilDestroyed(), debounceTime(1)).subscribe(v => {
      const min = v.min?.length ? +v.min : undefined;
      const max = v?.max?.length ? +v.max : undefined;
      this.control.setValue([min, max])
    })
  }

}
