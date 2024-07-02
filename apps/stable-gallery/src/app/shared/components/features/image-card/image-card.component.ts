import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AppService } from '../../../../core/services';
import { ImageItem } from '../../../../core/helpers';
import {
  ButtonComponent,
  FavoriteToggleComponent,
  NsfwToggleComponent,
} from '../../ui';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, merge } from 'rxjs';
import { DbService } from '../../../../core/db';

@Component({
  selector: 'feature-image-card',
  standalone: true,
  imports: [
    AsyncPipe,
    ButtonComponent,
    NsfwToggleComponent,
    FavoriteToggleComponent,
  ],
  templateUrl: './image-card.component.html',
  styleUrl: './image-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageCardComponent implements OnInit {
  public readonly app = inject(AppService);
  private readonly db = inject(DbService);

  @Input() image!: ImageItem;

  isNsfw = signal(false);
  isFavorite = signal(false);

  constructor() {
    merge(
      toObservable(this.isNsfw).pipe(distinctUntilChanged()),
      toObservable(this.isFavorite).pipe(distinctUntilChanged())
    )
      .pipe(debounceTime(1000), takeUntilDestroyed())
      .subscribe(() => {
        this.image.nsfw = this.isNsfw();
        this.image.favorite = this.isFavorite();
        this.db.update(this.image);
      });
  }

  ngOnInit() {
    this.isNsfw.set(this.image.nsfw);
    this.isFavorite.set(this.image.favorite);
  }

  onImageClick() {
    console.log(this.image);
    dialog$.imageViewer({image: this.image});
  }
}
