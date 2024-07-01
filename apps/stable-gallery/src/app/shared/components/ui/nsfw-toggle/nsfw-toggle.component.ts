import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AsyncPipe} from "@angular/common";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'ui-nsfw-toggle',
  standalone: true,
  imports: [AsyncPipe, MatTooltip],
  templateUrl: './nsfw-toggle.component.html',
  styleUrl: './nsfw-toggle.component.scss',
})
export class NsfwToggleComponent {
  @Input() value = false;
  @Output() onToggle = new EventEmitter<boolean>();
}
