import {Component, EventEmitter, Input, Output} from '@angular/core';
import {IconComponent} from "../icon/icon.component";

@Component({
  selector: 'ui-chips',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './chips.component.html',
  styleUrl: './chips.component.scss',
})
export class ChipsComponent<T> {
  @Input() label?: string;
  @Input() value?: T;
  @Input() clearable = false;

  @Output() onClick = new EventEmitter();
  @Output() onClear = new EventEmitter();

  onClicked() {
    this.onClick.emit();
  }

  onCleared() {
    this.onClear.emit();
  }
}
