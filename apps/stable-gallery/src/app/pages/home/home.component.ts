import {Component, inject} from '@angular/core';
import {GalleryComponent} from "../../shared/components/features";
import {ScanService} from "../../core/services";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [GalleryComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private scan = inject(ScanService)

  constructor() {
    this.scan.startScan();
  }
}
