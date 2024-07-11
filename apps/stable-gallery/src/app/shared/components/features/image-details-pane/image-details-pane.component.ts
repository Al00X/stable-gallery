import {Component, Input, OnChanges, OnInit, Output, signal, SimpleChanges} from '@angular/core';
import {ImageItem} from "../../../../core/helpers";
import {formatDate} from "@angular/common";
import {ItemRecord} from "../../../../core/interfaces";
import {ButtonComponent, IconComponent} from "../../ui";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'feature-image-details-pane',
  standalone: true,
  imports: [ButtonComponent, IconComponent, MatIcon],
  templateUrl: './image-details-pane.component.html',
  styleUrl: './image-details-pane.component.scss',
})
export class ImageDetailsPaneComponent implements OnInit, OnChanges {
  @Input() open = false;
  @Input() image?: ImageItem;
  @Input() absolute?: boolean;
  @Input() showImage?: boolean;

  isOpen = signal(false);
  isImageExpanded = signal(false);
  detailsSection = signal<
    | {
        main: ItemRecord<string | number | undefined>[];
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
      image: this.image
    })
  }

  private populateDetails() {
    if (!this.image) {
      this.detailsSection.set(undefined);
      return;
    }

    const image = this.image;
    this.detailsSection.set({
      main: [
        { label: 'Prompt', value: image.prompt },
        { label: 'Negative Prompt', value: image.negativePrompt },
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
