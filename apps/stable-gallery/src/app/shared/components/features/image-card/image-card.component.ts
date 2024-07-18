import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AppService, KeybindService } from '../../../../core/services';
import { ImageItem } from '../../../../core/helpers';
import {
  ButtonComponent,
  FavoriteToggleComponent,
  NsfwToggleComponent,
} from '../../ui';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'feature-image-card',
  standalone: true,
  imports: [
    AsyncPipe,
    ButtonComponent,
    NsfwToggleComponent,
    FavoriteToggleComponent,
    MatIcon,
  ],
  templateUrl: './image-card.component.html',
  styleUrl: './image-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageCardComponent {
  public readonly app = inject(AppService);
  public keybind = inject(KeybindService);

  @Input() image!: ImageItem;
  @Input() isSelected?: boolean;

  @Output() onMouseDown = new EventEmitter<MouseEvent>();
  @Output() onMouseUp = new EventEmitter<MouseEvent>();

  onImageMouseDown(e: MouseEvent) {
    this.onMouseDown.emit(e);
  }

  onImageMouseUp(e: MouseEvent) {
    this.onMouseUp.emit(e);
    console.log(this.image);
  }

  onImageDoubleClick() {
    if (!this.isSelected) return;
    dialog$.imageViewer({ image: this.image });
  }
}
