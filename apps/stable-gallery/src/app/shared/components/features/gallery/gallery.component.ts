import {Component, inject, signal} from '@angular/core';
import {ImageItem} from "../../../../core/helpers";
import {DbService} from "../../../../core/db";
import {debounceTime} from "rxjs";
import {ImagesService} from "../../../../core/services";

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent {
  private readonly db = inject(DbService);
  public readonly imageService = inject(ImagesService);

  items = signal<ImageItem[]>([]);

  constructor() {
    this.db.initialized$.subscribe(() => {
      this.get()
    })
    this.imageService.itemsUpdated$.pipe(debounceTime(2000)).subscribe(async () => {
      this.get();
    })
  }

  onImageClick(item: ImageItem) {
    console.log(item)
  }

  private async get() {
    if (!this.db.initialized$.value) return;
    this.items.set(await this.db.getImages({
      perPage: 100
    }));
  }
}
