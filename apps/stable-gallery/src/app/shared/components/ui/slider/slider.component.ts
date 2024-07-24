import {Component, DestroyRef, inject, Input, OnInit} from '@angular/core';
import {MatSlider, MatSliderRangeThumb, MatSliderThumb} from '@angular/material/slider';
import { formControl } from '../../../../core/helpers';
import { ReactiveFormsModule } from '@angular/forms';
import { LabelComponent } from '../label/label.component';
import { AsyncPipe } from '@angular/common';
import {combineLatest, debounceTime} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'ui-slider',
  standalone: true,
  imports: [
    MatSlider,
    MatSliderThumb,
    ReactiveFormsModule,
    LabelComponent,
    AsyncPipe,
    MatSliderRangeThumb,
  ],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
})
export class SliderComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  @Input() control = formControl<any>();
  @Input() label?: string;
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;
  @Input() range?: boolean;

  startControl = formControl();
  endControl = formControl();

  ngOnInit() {
    combineLatest({
      start: this.startControl.value$,
      end: this.endControl.value$,
    })
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(1))
      .subscribe((v) => {
        if (!this.range) return;
        const start = v?.start !== undefined && v?.start !== null ? +v.start : undefined;
        const end = v?.end !== undefined && v?.end !== null ? +v.end : undefined;
        this.control.setValue([start, end]);
      });

    this.startControl.setValue(this.min);
    this.endControl.setValue(this.max)
  }
}
