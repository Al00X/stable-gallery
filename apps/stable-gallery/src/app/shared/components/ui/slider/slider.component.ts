import { Component, Input } from '@angular/core';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { formControl } from '../../../../core/helpers';
import { ReactiveFormsModule } from '@angular/forms';
import { LabelComponent } from '../label/label.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'ui-slider',
  standalone: true,
  imports: [
    MatSlider,
    MatSliderThumb,
    ReactiveFormsModule,
    LabelComponent,
    AsyncPipe,
  ],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
})
export class SliderComponent {
  @Input() control = formControl<number>();
  @Input() label?: string;
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;
}
