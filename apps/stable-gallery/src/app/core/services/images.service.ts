import {inject, Injectable} from '@angular/core';
import {FilesService} from "./files.service";
import {AppService} from "./app.service";
import {ImageItem} from "../helpers/image.helper";
import {DbService} from "../db/db.service";
import {BehaviorSubject, debounceTime, Subject, Subscription} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ImagesService {
  private readonly file = inject(FilesService);
  private readonly app = inject(AppService);
  private readonly dbService = inject(DbService);

  isScanning$ = new BehaviorSubject(false);
  currentScanningFile$ = new BehaviorSubject<string | undefined>(undefined);
  newItemScanned$ = new Subject<void>();

  private _stopScanning?: () => void;
  private subs = new Subscription();

  startScan() {
    const appState = this.app.state;
    if (!appState.dirs.length) {
      console.warn('No directory is selected to scan');
      return;
    }
    this.isScanning$.next(true);

    const watcher = this.file.watch(appState.dirs)
    this.subs = new Subscription();
    this.subs.add(watcher.state.subscribe((state) => {
      if (!state.latest?.endsWith('.png') && !state.latest?.endsWith('.jpg') && !state.latest?.endsWith('.jpeg')) return;
      if (state.latest && state.latestAction === 'add' && !appState.scanned.includes(state.latest)) {
        const image = new ImageItem(state.latest);
        this.dbService.addImageEntry(image).then(() => {
          this.app.addToScanned(state.latest!);
          appState.scanned.push(state.latest!);
          this.currentScanningFile$.next(state.latest)
          this.newItemScanned$.next();
        }).catch(err => {
          if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
            this.app.addToScanned(state.latest!);
            appState.scanned.push(state.latest!);
          }
        });
      }
    }))
    this.subs.add(this.newItemScanned$.pipe(debounceTime(1000)).subscribe(() => {
      this.currentScanningFile$.next(undefined)
    }))
    this._stopScanning = watcher.unwatch;
  }

  stopScan() {
    this.isScanning$.next(false);
    this.subs.unsubscribe();
    this._stopScanning?.();
  }
}