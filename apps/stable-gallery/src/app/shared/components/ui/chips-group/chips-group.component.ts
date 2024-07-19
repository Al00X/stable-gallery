import {Component, ContentChildren, Input, QueryList} from '@angular/core';
import {ChipsComponent} from "../chips/chips.component";

@Component({
  selector: 'ui-chips-group',
  standalone: true,
  imports: [],
  templateUrl: './chips-group.component.html',
  styleUrl: './chips-group.component.scss'
})
export class ChipsGroupComponent<T> {
  @ContentChildren(ChipsComponent) childrenChips!: QueryList<ChipsComponent<T>>;

  @Input() clearable?: boolean;
}
