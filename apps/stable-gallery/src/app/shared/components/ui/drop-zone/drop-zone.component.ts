import {ChangeDetectorRef, Component, EventEmitter, HostListener, inject, NgZone, Output, signal} from '@angular/core';

@Component({
  selector: 'ui-drop-zone',
  standalone: true,
  imports: [],
  templateUrl: './drop-zone.component.html',
  styleUrl: './drop-zone.component.scss'
})
export class DropZoneComponent {
  private ngZone = inject(NgZone);

  isDragging = signal(false);

  @Output() onDrop = new EventEmitter<FileList>();

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

    const files = e.dataTransfer?.files;
    const item = e.dataTransfer?.items?.[0];
    if (item && item.kind !== 'file') {
      e.dataTransfer.items[0].getAsString((c) => {
        if (c.startsWith('file://')) return;
        this.ngZone.run(() => {
          this.onDrop.emit(files);
        })
      })
    } else {
      this.onDrop.emit(files);
    }
  }
}
