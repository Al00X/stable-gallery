import { Component, inject } from '@angular/core';
import { GalleryComponent } from '../../shared/components/features';
import { ScanService } from '../../core/services';
import { NgxFileDropModule } from 'ngx-file-drop';
import {
  DropZoneComponent,
  DropZoneOnDropEvent,
} from '../../shared/components/ui';
import { ImageItem } from '../../core/helpers';
import { imagesToTagsEntry, lower, tagEntry } from '../../core/db';
import {and, eq, inArray, like} from 'drizzle-orm';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [GalleryComponent, NgxFileDropModule, DropZoneComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private scan = inject(ScanService);

  constructor() {
    this.scan.startScan();

    setTimeout(() => {
      const query = 'body, magical, masterpiece';

      const subQuery = (t: string) => inArray(
        imagesToTagsEntry.tagId,
        db$.db.select({ tagId: tagEntry.id })
          .from(tagEntry)
          .where(like(lower(tagEntry.name), `%${t}%`))
      )

      let mainQuery = db$.db
        .select({ id: imagesToTagsEntry.imageId })
        .from(imagesToTagsEntry)
        .where(
          and(eq(imagesToTagsEntry.negative, false))
        )

      for(const tag of query.split(',').map(t => t.trim())) {
        mainQuery = mainQuery.intersect(db$.db
          .select({ id: imagesToTagsEntry.imageId })
          .from(imagesToTagsEntry)
          .where(
            subQuery(tag)
          )) as any
      }

      mainQuery.then(t => console.log(t))
      console.log(mainQuery.toSQL())
    });
  }

  async onFileDragAndDrop(e: DropZoneOnDropEvent) {
    const file = e?.at(0);
    if (!file) return;
    const image = new ImageItem(file);
    if (!image.isImageValid()) return;
    image.load().then(() => {
      dialog$.imageViewer({ image, loadFromBuffer: typeof file !== 'string' });
    });
  }
}
