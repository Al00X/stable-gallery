import {
  Component,
  EventEmitter,
  HostListener,
  inject,
  NgZone,
  Output,
  signal,
} from '@angular/core';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatProgressBar} from "@angular/material/progress-bar";

export type DropZoneOnDropEvent = (File | string)[]

@Component({
  selector: 'ui-drop-zone',
  standalone: true,
  imports: [MatProgressSpinner, MatProgressBar],
  templateUrl: './drop-zone.component.html',
  styleUrl: './drop-zone.component.scss',
})
export class DropZoneComponent {
  private ngZone = inject(NgZone);

  isDragging = signal(false);
  loading = signal(false);

  @Output() onDrop = new EventEmitter<DropZoneOnDropEvent>();

  private _target: EventTarget | null = null;

  @HostListener('dragenter', ['$event'])
  onDragEnterEvent(e: DragEvent) {
    e.stopPropagation();
    e.preventDefault();
    this._target = e.target;
    this.isDragging.set(true);
  }

  @HostListener('dragover', ['$event'])
  onDragOverEvent(e: DragEvent) {
    e.preventDefault();
  }

  @HostListener('dragleave', ['$event'])
  onDragLeaveEvent(e: DragEvent) {
    if (this._target !== e.target) return;
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(false);
  }

  @HostListener('drop', ['$event'])
  onDropEvent(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);

    const files = Array.from(e.dataTransfer?.files ?? []);
    const item = e.dataTransfer?.items?.[0];

    if (item && item.kind !== 'file') {
      e.dataTransfer.items[0].getAsString((c) => {
        if (c.startsWith('file://')) return;

        if (c.startsWith('https://')) {
          this.ngZone.run(() => {
            this.loading.set(true);
            fetch(c)
              .then((r) => r.blob())
              .then((b) => fs$.saveTemp(b, c.substring(c.lastIndexOf('/') + 1)))
              .then((b) => {
                this.onDrop.emit([b]);
                this.loading.set(false);
              });
          });
          return;
        }

        this.ngZone.run(() => {
          this.onDrop.emit(files);
        });
      });
    } else {
      this.onDrop.emit(files);
    }
  }
}
