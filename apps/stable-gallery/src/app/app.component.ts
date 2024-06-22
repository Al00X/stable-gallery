import {Component, inject} from '@angular/core';
import { RouterModule } from '@angular/router';
import {FilesService} from "./services/files.service";

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  fileService = inject(FilesService);

  constructor() {
    this.fileService.scan('D:/Dreams')
  }
}
