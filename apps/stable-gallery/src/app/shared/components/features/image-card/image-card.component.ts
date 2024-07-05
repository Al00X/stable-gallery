import {
  ChangeDetectionStrategy,
  Component, EventEmitter,
  inject,
  Input, Output,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AppService } from '../../../../core/services';
import { ImageItem } from '../../../../core/helpers';
import {
  ButtonComponent,
  FavoriteToggleComponent,
  NsfwToggleComponent,
} from '../../ui';

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
export class ImageCardComponent {
  public readonly app = inject(AppService);

  @Input() image!: ImageItem;
  @Input() isSelected?: boolean;

  @Output() onSelect = new EventEmitter();

  onImageClick() {
    this.onSelect.emit();
    console.log(this.image);
  }

  onImageDoubleClick() {
    if (!this.isSelected) return;
    dialog$.imageViewer({image: this.image});
  }
}
