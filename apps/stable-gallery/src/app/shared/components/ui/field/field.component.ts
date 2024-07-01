import {Component, DestroyRef, inject, Input, OnInit} from '@angular/core';
import {formControl} from "../../../../core/helpers";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {LabelComponent} from "../label/label.component";

@Component({
  selector: 'ui-field',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, LabelComponent],
  templateUrl: './field.component.html',
  styleUrl: './field.component.scss',
})
export class FieldComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  @Input() control = formControl<any>();
  @Input() label = '';
  @Input() type: 'text' | 'number' = 'text';
  @Input() placeholder?: string;
  @Input() min?: number;
  @Input() max?: number;
  @Input() width?: string;

  ngOnInit() {
    this.control.value$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.checkMinMax();
      });
  }

  onNumericButton(increase: boolean) {
    if (this.type !== 'number') return;
    const inc = increase ? 1 : -1;
    const currentValue = parseInt(this.control.value);
    if (
      (this.min !== undefined && currentValue + inc < this.min) ||
      (this.max !== undefined && currentValue + inc > this.max)
    )
      return;
    this.control.setValue(currentValue + inc);
  }

  private checkMinMax(e?: KeyboardEvent) {
    if (this.type !== 'number') return;
  }
}
