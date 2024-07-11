import { Component, computed, inject, signal } from '@angular/core';
import { formControl, ImageItem } from '../../../../core/helpers';
import {debounceTime, distinctUntilChanged, merge} from 'rxjs';
import { AppService, ScanService } from '../../../../core/services';
import { AsyncPipe, NgIf } from '@angular/common';
import {
  ButtonGroupComponent,
  FieldComponent,
  MasonryComponent,
  SliderComponent,
} from '../../ui';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ImageCardComponent } from '../image-card/image-card.component';
import { ImageDetailsPaneComponent } from '../image-details-pane/image-details-pane.component';
import { ItemRecord } from '../../../../core/interfaces';

type SortByOptions = 'createdAt' | 'addedAt';
type SortDirection = 'asc' | 'desc';

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
    ImageDetailsPaneComponent,
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
    sortBy?: SortByOptions;
    sortDirection?: SortDirection;
  }>({});
  page = signal(0);
  currentCount = computed(() => this.items().length);
  allLoaded = signal(false);
  selectedImage = signal<ImageItem | undefined>(undefined);
  openDetails = signal(
    this.app.state.settings.openDetailsTabInGalleryByDefault
  );

  viewStyleControl = formControl(this.app.state.settings.galleryViewStyle);
  itemPerRowControl = formControl(this.app.state.settings.galleryItemPerRow);
  columnsControl = formControl(this.app.state.settings.galleryColumns);
  itemSizeControl = formControl(this.app.state.settings.galleryItemAspectRatio);
  sortByControl = formControl<SortByOptions>(this.app.state.settings.gallerySortBy as any);
  sortDirectionControl = formControl<SortDirection>(this.app.state.settings.gallerySortDirection as any);
  searchControl = formControl('');

  sortByItems: ItemRecord<SortByOptions>[] = [
    { label: 'Date Created', value: 'createdAt' },
    { label: 'Date Added', value: 'addedAt' },
  ];

  itemTrackBy = (_: number, item: ImageItem) => item.path;

  constructor() {
    this.updateFilters();

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

    merge(
      this.sortByControl.valueChanges.pipe(distinctUntilChanged()),
      this.sortDirectionControl.valueChanges.pipe(distinctUntilChanged()),
      this.searchControl.valueChanges.pipe(
        distinctUntilChanged(),
        debounceTime(SEARCH_DEBOUNCE)
      ),
    )
      .pipe(debounceTime(5), takeUntilDestroyed())
      .subscribe(() => {
        this.updateFilters();
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

    this.app.setSettings({
      gallerySortBy: filters.sortBy,
      gallerySortDirection: filters.sortDirection,
    })

    const fn = async () =>
      await db$.getImages({
        page: this.page(),
        perPage,
        search: filters.search,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
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

  private updateFilters() {
    const search = this.searchControl.value;
    const sortBy = this.sortByControl.value;
    const sortDir = this.sortDirectionControl.value;
    this.filters.set({
      sortBy,
      search,
      sortDirection: sortDir,
    });
  }
}
