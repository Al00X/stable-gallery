import {Component, Input} from '@angular/core';
import {formControl} from "../../../../core/helpers";
import {ItemRecord} from "../../../../core/interfaces";
import {AsyncPipe} from "@angular/common";
import {LabelComponent} from "../label/label.component";
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'ui-button-group',
  standalone: true,
  imports: [AsyncPipe, LabelComponent, MatIcon, MatTooltip],
  templateUrl: './button-group.component.html',
  styleUrl: './button-group.component.scss',
})
export class ButtonGroupComponent {
  @Input() control = formControl<any>();
  @Input() label?: string;
  @Input() items: ItemRecord<any>[] = [];

  onClick(item: ItemRecord<any>) {
    if (item.value === this.control.value) return;
    this.control.setValue(item.value);
  }
}
