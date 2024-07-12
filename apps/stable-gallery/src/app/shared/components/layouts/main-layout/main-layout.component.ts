import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterOutlet} from "@angular/router";
import {ScanService} from "../../../../core/services";
import {IconComponent, ToggleComponent} from "../../ui";
import {MatProgressBar} from "@angular/material/progress-bar";

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ToggleComponent,
    MatProgressBar,
    IconComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  public readonly scan = inject(ScanService);
}
