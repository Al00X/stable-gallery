import {Component, inject, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ItemRecord, ItemRecords$} from "../../../../core/interfaces";
import {formControl} from "../../../../core/helpers";
import {BehaviorSubject, Observable, of, Subscription} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {KeybindService} from "../../../../core/services";

@Component({
  selector: 'ui-tab-group',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './tab-group.component.html',
  styleUrl: './tab-group.component.scss',
})
export class TabGroupComponent<T> implements OnChanges {
  private readonly keybind = inject(KeybindService)

  @Input() control = formControl<T[]>([]);
  @Input() items?: ItemRecords$<T>;

  items$ = new BehaviorSubject<ItemRecord<T>[] | undefined>(undefined);
  private _sub = new Subscription();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items']) {
      this._sub?.unsubscribe();
      const observable =
        this.items instanceof Observable ? this.items : of(this.items);
      this._sub = observable.subscribe((v) => {
        this.items$.next(v);
      });
    }
  }

  isSelected(item: ItemRecord<T>) {
    return this.control.value?.includes(item.value);
  }

  toggle(group: ItemRecord<T>) {
    const value = this.control.value || [];

    if (!this.keybind.ctrl()) {
      this.control.setValue([group.value]);
      return;
    }

    if (value.includes(group.value)) {
      this.control.setValue(value.filter((v) => v !== group.value));
    } else {
      this.control.setValue([...value, group.value]);
    }
  }
}
