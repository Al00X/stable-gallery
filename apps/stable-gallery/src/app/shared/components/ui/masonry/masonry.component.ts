import {Component, ContentChild, Input, OnChanges, signal, SimpleChanges, TemplateRef} from '@angular/core';
import {NgForOf, NgIf, NgTemplateOutlet} from "@angular/common";

type ProcessedItem<T> = { index: number, items: T[] };

@Component({
  selector: 'ui-masonry',
  standalone: true,
  imports: [NgForOf, NgTemplateOutlet, NgIf],
  templateUrl: './masonry.component.html',
  styleUrl: './masonry.component.scss',
})
export class MasonryComponent<T> implements OnChanges {
  @ContentChild(TemplateRef) itemTemplate?: TemplateRef<{ item: T }>;

  @Input() items: T[] = [];
  @Input() trackBy: (i: number, item: T) => any = (i, t) => t;
  @Input() cols = 3;

  processedItems = signal<ProcessedItem<T>[]>([]);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items'] || changes['cols']) {
      const newItems: ProcessedItem<T>[] = [];
      for (let i = 0; i < this.cols; i++) {
        newItems.push({ index: i, items: [] });
      }
      for (let i = 0; i < this.items.length; i++) {
        newItems[i % this.cols].items.push(this.items[i]);
      }
      this.processedItems.set(newItems);
    }
  }
}
