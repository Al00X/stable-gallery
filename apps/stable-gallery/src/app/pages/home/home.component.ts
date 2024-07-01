import { Component } from '@angular/core';
import {GalleryComponent} from "../../shared/components/features";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [GalleryComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
