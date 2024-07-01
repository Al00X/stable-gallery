import {Component, Input} from '@angular/core';

@Component({
  selector: 'ui-label',
  standalone: true,
  imports: [],
  templateUrl: './label.component.html',
  styleUrl: './label.component.scss'
})
export class LabelComponent {
  @Input() text?: string;
}
