import {Component, EventEmitter, Input, Output} from '@angular/core';
import {formControl} from "../../../../core/helpers";
import {LabelComponent} from "../label/label.component";
import {AsyncPipe} from "@angular/common";
import {IconComponent} from "../icon/icon.component";
import {ButtonComponent} from "../button/button.component";

export interface ListFieldAddEvent<T> {
  addToList(item: T): void;
}

@Component({
  selector: 'ui-list-field',
  standalone: true,
  imports: [LabelComponent, AsyncPipe, IconComponent, ButtonComponent],
  templateUrl: './list-field.component.html',
  styleUrl: './list-field.component.scss',
})
export class ListFieldComponent<T> {
  @Input() control = formControl<T[]>([]);
  @Input() label?: string;
  @Input() addButton?: string;

  @Output() onAdd = new EventEmitter<ListFieldAddEvent<T>>();

  onAddButtonClick() {
    this.onAdd.emit({
      addToList: (item: T) => this.addToList(item),
    });
  }

  addToList(item: T) {
    const current = this.control.value;
    if (!current || !current.length) {
      this.control.setValue([item]);
    } else if (!current.includes(item)) {
      current.push(item);
      this.control.setValue(current);
    }
  }

  removeFromList(index: number) {
    const current = this.control.value;
    if (current && current.length) {
      current.splice(index, 1);
      this.control.setValue(current);
    }
  }
}
