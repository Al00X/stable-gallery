import {Component, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges} from '@angular/core';
import {ButtonComponent, FavoriteToggleComponent, NsfwToggleComponent} from "../../ui";
import {ImageItem} from "../../../../core/helpers";

export type ImageActionEvent = 'nsfw' | 'favorite';

@Component({
  selector: 'feature-image-actions',
  standalone: true,
  imports: [ButtonComponent, FavoriteToggleComponent, NsfwToggleComponent],
  templateUrl: './image-actions.component.html',
  styleUrl: './image-actions.component.scss',
})
export class ImageActionsComponent implements OnChanges {
  @Input() image?: ImageItem;
  @Input() images?: ImageItem[];

  @Output() onAction = new EventEmitter<ImageActionEvent>();

  nsfw = signal(false);
  favorite = signal(false);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['images'] && this.images) {
      this.nsfw.set(this.images.every(t => t.nsfw()))
      this.favorite.set(this.images.every(t => t.favorite()))
    }
  }

  toggleNsfw() {
    if (this.image) {
      this.image.toggleNsfw();
    } else {
      this.nsfw.set(!this.nsfw())
      this.images?.forEach(t => t.toggleNsfw(this.nsfw()));
    }
  }

  toggleFavorite() {
    if (this.image) {
      this.image.toggleFavorite();
    } else {
      this.favorite.set(!this.favorite())
      this.images?.forEach(t => t.toggleFavorite(this.favorite()));
    }
  }
}
