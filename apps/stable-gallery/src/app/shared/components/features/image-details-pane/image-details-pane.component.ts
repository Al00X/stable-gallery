import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { ImageItem } from '../../../../core/helpers';
import {AsyncPipe, formatDate} from '@angular/common';
import { ItemRecord } from '../../../../core/interfaces';
import { ButtonComponent, IconComponent } from '../../ui';
import { MatIcon } from '@angular/material/icon';
import { AppService } from '../../../../core/services';
import {map, Observable} from "rxjs";
import {fromPromise} from "rxjs/internal/observable/innerFrom";

@Component({
  selector: 'feature-image-details-pane',
  standalone: true,
  imports: [ButtonComponent, IconComponent, MatIcon, AsyncPipe],
  templateUrl: './image-details-pane.component.html',
  styleUrl: './image-details-pane.component.scss',
})
export class ImageDetailsPaneComponent implements OnInit, OnChanges {
  private app = inject(AppService);

  @Input() open = false;
  @Input() image?: ImageItem;
  @Input() absolute?: boolean;
  @Input() showImage?: boolean;

  isOpen = signal(false);
  isImageExpanded = signal(this.app.state.settings.detailsTabImageExpanded);
  detailsSection = signal<
    | {
        main: ItemRecord<Observable<string | number | undefined>>[];
        other: ItemRecord<string | number | undefined>[];
        metadata: ItemRecord<string | number | undefined>[];
      }
    | undefined
  >(undefined);

  ngOnInit() {
    this.isOpen.set(this.open);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['image']) {
      this.populateDetails();
    }
  }

  openImage() {
    if (!this.image) return;
    dialog$.imageViewer({
      image: this.image,
    });
  }

  toggleExpand() {
    this.isImageExpanded.set(!this.isImageExpanded());
    this.app.setSettings({
      detailsTabImageExpanded: this.isImageExpanded(),
    });
  }

  private populateDetails() {
    if (!this.image) {
      this.detailsSection.set(undefined);
      return;
    }

    this.image.partialLoad();
    const image = this.image;
    this.detailsSection.set({
      main: [
        {
          label: 'Prompt',
          value: this.image.model$.pipe().pipe(map((m) => m?.prompt)),
        },
        {
          label: 'Negative Prompt',
          value: this.image.model$.pipe().pipe(map((m) => m?.negativePrompt)),
        },
      ],
      other: [
        { label: 'Seed', value: image.seed },
        { label: 'Sampler', value: image.sampler },
        { label: 'Steps', value: image.steps },
        { label: 'CFG', value: image.cfgScale },
        { label: 'Clip Skip', value: image.clipSkip },
        { label: 'Model Hash', value: image.modelHash },
      ],
      metadata: [
        { label: 'Size', value: `${image.width} x ${image.height}` },
        {
          label: 'Created At',
          value: image.createdAt
            ? formatDate(image.createdAt, 'yyyy/MM/dd', 'en')
            : undefined,
        },
        {
          label: 'Updated At',
          value: image.updatedAt
            ? formatDate(image.updatedAt, 'yyyy/MM/dd', 'en')
            : undefined,
        },
      ],
    });
  }
}
