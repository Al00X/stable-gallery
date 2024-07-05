import {Component, Input, OnInit} from '@angular/core';
import {formControl} from "../../../../core/helpers";
import {AsyncPipe} from "@angular/common";
import {MatTooltip} from "@angular/material/tooltip";
import {LabelComponent} from "../label/label.component";

@Component({
  selector: 'ui-toggle',
  standalone: true,
  imports: [AsyncPipe, MatTooltip, LabelComponent],
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.scss',
})
export class ToggleComponent implements OnInit {
  @Input() control = formControl<boolean>(false);
  @Input() label?: string;
  @Input() activeText = 'On';
  @Input() inactiveText = 'Off';
  @Input() activeTooltip?: string;
  @Input() inactiveTooltip?: string;

  ngOnInit() {
    this.activeTooltip ??= `Toggle to ${this.inactiveText}`;
    this.inactiveTooltip ??= `Toggle to ${this.activeText}`;
  }

  onToggle() {
    this.control.setValue(!this.control.value);
  }
}
