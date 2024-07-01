import {Component, inject, signal} from '@angular/core';
import {formControl, ImageItem} from "../../../../core/helpers";
import {DbService} from "../../../../core/db";
import {debounceTime, distinctUntilChanged} from "rxjs";
import {AppService, ImagesService} from "../../../../core/services";
import {AsyncPipe} from "@angular/common";
import {FieldComponent, SliderComponent} from "../../ui";
import {MatSlider, MatSliderThumb} from "@angular/material/slider";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

const SEARCH_DEBOUNCE = 150;

@Component({
  selector: 'feature-gallery',
  standalone: true,
  imports: [
    AsyncPipe,
    FieldComponent,
    MatSlider,
    MatSliderThumb,
    SliderComponent,
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent {
  private readonly db = inject(DbService);
  public readonly imageService = inject(ImagesService);
  public readonly app = inject(AppService);

  items = signal<ImageItem[]>([]);
  filters = signal<{
    search?: string;
  }>({})

  itemPerRowControl = formControl(this.app.state.settings.galleryItemPerRow);
  itemSizeControl = formControl(this.app.state.settings.galleryItemAspectRatio);
  searchControl = formControl('');

  constructor() {
    this.db.initialized$.subscribe(() => {
      this.get();
    });
    this.imageService.itemsUpdated$
      .pipe(debounceTime(2000))
      .subscribe(async () => {
        this.get();
      });

    this.itemSizeControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(v => {
      this.app.setSettings({
        galleryItemAspectRatio: v,
      })
    })
    this.itemPerRowControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(v => {
      this.app.setSettings({
        galleryItemPerRow: v,
      })
    })
    this.searchControl.valueChanges.pipe(distinctUntilChanged(), debounceTime(SEARCH_DEBOUNCE), takeUntilDestroyed()).subscribe(v => {
      this.filters.update(s => ({
        ...s,
        search: v,
      }))
      this.get();
    })
  }

  onImageClick(item: ImageItem) {
    console.log(item);
  }

  private async get() {
    if (!this.db.initialized$.value) return;
    const filters = this.filters();
    this.items.set(
      await this.db.getImages({
        perPage: 100,
        search: filters.search
      })
    );
  }
}
