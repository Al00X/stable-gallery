import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import {
  formControl,
  ImageItem,
  isObjectEmpty,
  SelectionModel,
} from '../../../../core/helpers';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  merge,
  Observable,
  skip,
} from 'rxjs';
import {
  AppService,
  KeybindService,
  ScanService,
} from '../../../../core/services';
import { AsyncPipe, NgIf } from '@angular/common';
import {
  ButtonComponent,
  ButtonGroupComponent,
  ChipsComponent,
  FieldComponent,
  IconComponent,
  MasonryComponent,
  SliderComponent,
  TabGroupComponent,
} from '../../ui';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ImageCardComponent } from '../image-card/image-card.component';
import { ImageDetailsPaneComponent } from '../image-details-pane/image-details-pane.component';
import { ItemRecord } from '../../../../core/interfaces';
import { ImageActionsComponent } from '../image-actions/image-actions.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { ViewOptionsFormComponent } from '../view-options-form/view-options-form.component';
import { FilterFormComponent } from '../filter-form/filter-form.component';
import { ImageQueryModel } from '../../../../core/db';

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
    ImageActionsComponent,
    IconComponent,
    MatMenu,
    MatMenuTrigger,
    MatTooltip,
    ViewOptionsFormComponent,
    FilterFormComponent,
    ButtonComponent,
    ChipsComponent,
    TabGroupComponent,
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent {
  public readonly scan = inject(ScanService);
  public readonly app = inject(AppService);
  public readonly keybind = inject(KeybindService);

  @ViewChild('FilterForm') filterForm!: FilterFormComponent;

  items = signal<ImageItem[]>([]);
  query = signal<ImageQueryModel>({});
  page = signal(0);
  currentCount = computed(() => this.items().length);
  allLoaded = signal(false);
  openDetails = signal(
    this.app.state.settings.openDetailsTabInGalleryByDefault,
  );
  currentFilterModel = signal<ImageQueryModel | undefined>(undefined);
  activeFilterItems = signal<ItemRecord<any>[]>([]);

  firstHighlightedImage = computed(() => this.selectionModel.selected().at(0));

  private _mouseDownState?: {
    index: number;
    image: ImageItem;
    isSelected: boolean;
  };
  private _lastMouseMove?: number;
  private _lastSelectionRange?: { l: number; h: number };

  selectionModel = new SelectionModel<ImageItem>(0, true, [], (t) => t.path);
  filterGroups$: Observable<ItemRecord<string>[]> = this.app.filterGroups$.pipe(
    map((items) =>
      items?.map((t) => ({
        label: t.name,
        value: t.name,
      })),
    ),
  );

  sortByControl = formControl<SortByOptions>(
    this.app.state.settings.gallerySortBy as any,
  );
  sortDirectionControl = formControl<SortDirection>(
    this.app.state.settings.gallerySortDirection as any,
  );
  searchControl = formControl('');
  filterGroupControl = formControl<string[]>([]);

  sortByItems: ItemRecord<SortByOptions>[] = [
    { label: 'Date Created', value: 'createdAt' },
    { label: 'Date Added', value: 'addedAt' },
  ];

  itemTrackBy = (_: number, item: ImageItem) => item.path;

  constructor() {
    this.updateQueries();

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

    merge(
      this.sortByControl.valueChanges.pipe(distinctUntilChanged()),
      this.sortDirectionControl.valueChanges.pipe(distinctUntilChanged()),
      this.filterGroupControl.valueChanges.pipe(distinctUntilChanged()),
      this.searchControl.valueChanges.pipe(
        distinctUntilChanged(),
        debounceTime(SEARCH_DEBOUNCE),
      ),
    )
      .pipe(debounceTime(2), takeUntilDestroyed())
      .subscribe(() => {
        this.updateQueries();
      });

    toObservable(this.query)
      .pipe(skip(1), takeUntilDestroyed(), debounceTime(2))
      .subscribe(() => {
        this.get(true);
      });
  }

  onScroll(e: Event) {
    const el = e.target as HTMLDivElement;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_THRESHOLD) {
      this.get();
    }
  }

  onImageMouseDown(index: number, item: ImageItem) {
    this._lastSelectionRange = undefined;
    this._lastMouseMove = undefined;
    if (!this.keybind.ctrl() && !this.keybind.shift()) {
      this.selectionModel.clear();
    }
    this._mouseDownState = {
      index,
      image: item,
      isSelected: this.selectionModel.isSelected(item),
    };
  }
  onImageMouseMove(index: number, item: ImageItem) {
    if (this._lastMouseMove === index) return;
    if (!this._mouseDownState) return;
    this._lastMouseMove = index;
    this.highlightImageRange(
      this._mouseDownState.index,
      index,
      this._mouseDownState.isSelected,
    );
  }
  onImageMouseUp(index: number, item: ImageItem) {
    const _state = this._mouseDownState;
    this._mouseDownState = undefined;

    if (this.keybind.shift()) {
      return;
    }
    if (!_state || _state.index === index) {
      if (_state?.isSelected) {
        this.selectionModel.deselect(item);
      } else {
        this.selectionModel.select(item);
      }
      return;
    }
    this.highlightImageRange(_state.index, index, _state.isSelected);
  }

  setFilterModel() {
    const model = this.filterForm.getModel();
    this.currentFilterModel.set(isObjectEmpty(model) ? undefined : model);
    this.activeFilterItems.set(this.filterForm.getActiveItems());
    this.updateQueries();
  }

  resetFilterModel() {
    this.filterForm.reset();
    this.currentFilterModel.set(undefined);
    this.activeFilterItems.set([]);
    this.updateQueries();
  }

  saveFilterGroup() {
    dialog$.filterGroupCrud({
      filters: this.currentFilterModel()
    }).afterSubmit().subscribe(() => {
      // ... ?
    })
  }

  private highlightImageRange(start: number, end: number, deselect?: boolean) {
    const l = start > end ? end : start;
    const h = (start > end ? start : end) + 1;
    if (deselect) {
      this.selectionModel.deselect(...this.items().slice(l, h));
    } else {
      this.selectionModel.select(...this.items().slice(l, h));
    }
    if (
      this._lastSelectionRange !== undefined &&
      this._lastSelectionRange.h > h
    ) {
      if (deselect) {
        this.selectionModel.select(
          ...this.items().slice(h, this._lastSelectionRange.h + 1),
        );
      } else {
        this.selectionModel.deselect(
          ...this.items().slice(h, this._lastSelectionRange.h + 1),
        );
      }
    }
    if (
      this._lastSelectionRange !== undefined &&
      this._lastSelectionRange.l < l
    ) {
      if (deselect) {
        this.selectionModel.select(
          ...this.items().slice(this._lastSelectionRange.l, l),
        );
      } else {
        this.selectionModel.deselect(
          ...this.items().slice(this._lastSelectionRange.l, l),
        );
      }
    }
    this._lastSelectionRange = { l, h };
  }

  private async get(reset?: boolean) {
    if (!db$.initialized$.value) return;
    const filters = this.query();
    const perPage = 100;

    this.app.setSettings({
      gallerySortBy: filters.sortBy,
      gallerySortDirection: filters.sortDirection,
    });

    const fn = async () =>
      await db$.getImages({
        ...filters,
        page: this.page(),
        perPage,
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

  private updateQueries() {
    const model = this.currentFilterModel();
    const search = this.searchControl.value;
    const sortBy = this.sortByControl.value;
    const sortDir = this.sortDirectionControl.value;
    const filterGroups = this.filterGroupControl.value.map((t) =>
      this.app.state.filterGroups.find((y) => y.name === t)!.filters,
    );
    this.query.set({
      ...model,
      sortBy,
      search,
      sortDirection: sortDir,
      preFilters: filterGroups,
    });
  }
}
