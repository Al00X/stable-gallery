import {Component, Input} from '@angular/core';
import {formControl} from "../../../../core/helpers";
import {AsyncPipe} from "@angular/common";

@Component({
  selector: 'ui-toggle',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.scss',
})
export class ToggleComponent {
  @Input() control = formControl<boolean>(false);
  @Input() activeText = 'On';
  @Input() inactiveText = 'Off';

  onToggle() {
    this.control.setValue(!this.control.value);
  }
}
