import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
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

  onImageClick() {
    console.log(this.image);
    dialog$.imageViewer({image: this.image});
  }
}
