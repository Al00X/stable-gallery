import {
  Component,
  DestroyRef,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { formControl } from '../../../../core/helpers';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LabelComponent } from '../label/label.component';
import { MatIcon } from '@angular/material/icon';
import { MatOption, MatSelect } from '@angular/material/select';
import { ItemRecord, ItemRecords$ } from '../../../../core/interfaces';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import {
  OptionsTriggerDirective,
  SelectOptionsComponent,
} from '../select-options';

@Component({
  selector: 'ui-field',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    LabelComponent,
    MatIcon,
    MatSelect,
    MatOption,
    AsyncPipe,
    OptionsTriggerDirective,
    SelectOptionsComponent,
  ],
  templateUrl: './field.component.html',
  styleUrl: './field.component.scss',
})
export class FieldComponent implements OnInit, OnChanges {
  private destroyRef = inject(DestroyRef);

  @ViewChild('Select') selectComponent?: MatSelect;

  @Input() control = formControl<any>();
  @Input() controlType: 'textbox' | 'select' = 'textbox';
  @Input() icon?: string;
  @Input() label = '';
  @Input() type: 'text' | 'number' = 'text';
  @Input() placeholder?: string;
  @Input() min?: number;
  @Input() max?: number;
  @Input() width?: string;
  @Input() items?: ItemRecords$<any>;

  items$ = new BehaviorSubject<ItemRecord<any>[]>([]);

  private itemsSub = new Subscription();

  ngOnInit() {
    this.control.value$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.checkMinMax();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items']) {
      if (this.items instanceof Observable) {
        this.itemsSub.unsubscribe();
        this.itemsSub = this.items
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((items) => this.items$.next(items ?? []));
      } else {
        this.items$.next(this.items ?? []);
      }
    }
  }

  onFieldClick() {}

  onNumericButton(increase: boolean) {
    if (this.type !== 'number') return;
    const inc = increase ? 1 : -1;
    let currentValue = parseInt(this.control.value);
    if (isNaN(currentValue)) {
      currentValue = this.min ?? 0;
    }
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
