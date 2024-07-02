import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'ui-favorite-toggle',
  standalone: true,
  imports: [MatIcon, MatTooltip],
  templateUrl: './favorite-toggle.component.html',
  styleUrl: './favorite-toggle.component.scss',
})
export class FavoriteToggleComponent {
  @Input() value?: boolean;
  @Output() onToggle = new EventEmitter<boolean>();
}
