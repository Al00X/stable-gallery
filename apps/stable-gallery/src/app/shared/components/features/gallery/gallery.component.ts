import {Component, computed, inject, signal} from '@angular/core';
import { formControl, ImageItem } from '../../../../core/helpers';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AppService, ScanService } from '../../../../core/services';
import {AsyncPipe, NgIf} from '@angular/common';
import {ButtonGroupComponent, FieldComponent, MasonryComponent, SliderComponent} from '../../ui';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ImageCardComponent } from '../image-card/image-card.component';

const SEARCH_DEBOUNCE = 150;
const SCROLL_THRESHOLD = 200;

@Component({
  selector: 'feature-gallery',
  standalone: true,
  imports: [
    AsyncPipe,
    FieldComponent,
    MatSlider,
    MatSliderThumb,
    SliderComponent,
    ImageCardComponent,
    ButtonGroupComponent,
    MasonryComponent,
    NgIf,
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent {
  public readonly scan = inject(ScanService);
  public readonly app = inject(AppService);

  items = signal<ImageItem[]>([]);
  filters = signal<{
    search?: string;
  }>({});
  page = signal(0);
  currentCount = computed(() => this.items().length);
  allLoaded = signal(false);

  viewStyleControl = formControl(this.app.state.settings.galleryViewStyle);
  itemPerRowControl = formControl(this.app.state.settings.galleryItemPerRow);
  columnsControl = formControl(this.app.state.settings.galleryColumns);
  itemSizeControl = formControl(this.app.state.settings.galleryItemAspectRatio);
  searchControl = formControl('');

  itemTrackBy = (_: number, item: ImageItem) => item.path;

  constructor() {
    db$.initialized$.subscribe(() => {
      this.get(true);
    });
    this.scan.itemAdded$.pipe(takeUntilDestroyed()).subscribe((image) => {
      this.items.update((v) => {
        v.unshift(image);
        return v;
      });
    });
    this.scan.itemRemoved$.pipe(takeUntilDestroyed()).subscribe((path) => {
      this.items.update((v) => {
        const i = v.findIndex((t) => t.path === path);
        if (i !== -1) {
          v.splice(i, 1);
        }
        return v;
      });
    });
    // this.imageService.itemsUpdated$
    //   .pipe(debounceTime(2000))
    //   .subscribe(async () => {
    //     this.get(true);
    //   });

    this.itemSizeControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((v) => {
        this.app.setSettings({
          galleryItemAspectRatio: v,
        });
      });
    this.itemPerRowControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((v) => {
        this.app.setSettings({
          galleryItemPerRow: v,
        });
      });
    this.viewStyleControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((v) => {
        this.app.setSettings({
          galleryViewStyle: v,
        });
      });
    this.columnsControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((v) => {
        this.app.setSettings({
          galleryColumns: v,
        });
      });

    this.searchControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(SEARCH_DEBOUNCE),
        takeUntilDestroyed()
      )
      .subscribe((v) => {
        this.filters.update((s) => ({
          ...s,
          search: v,
        }));
        this.get(true);
      });
  }

  onScroll(e: Event) {
    const el = e.target as HTMLDivElement;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_THRESHOLD) {
      this.get();
    }
  }

  private async get(reset?: boolean) {
    if (!db$.initialized$.value) return;
    const filters = this.filters();
    const perPage = 100;

    const fn = async () =>
      await db$.getImages({
        page: this.page(),
        perPage,
        search: filters.search,
      });
    if (reset) {
      this.page.set(1);
      this.items.set(await fn());
    } else {
      if (this.allLoaded()) return;
      this.page.update((v) => v + 1);
      const res = await fn();
      if (res.length < perPage) {
        this.allLoaded.set(true);
      }
      this.items.update((v) => v.concat(res));
    }
  }
}
