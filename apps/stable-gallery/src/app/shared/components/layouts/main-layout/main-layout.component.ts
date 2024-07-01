import {Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterOutlet} from "@angular/router";
import {ImagesService} from "../../../../core/services";

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  public readonly imageService = inject(ImagesService);
}
