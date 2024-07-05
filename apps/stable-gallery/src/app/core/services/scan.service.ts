import {inject, Injectable} from '@angular/core';
import {FilesService} from "./files.service";
import {AppService} from "./app.service";
import {ImageItem} from "../helpers";
import {BehaviorSubject, combineLatest, debounceTime, filter, map, Subject, Subscription} from "rxjs";
import {CacheService} from "./cache.service";

@Injectable({
  providedIn: 'root'
})
export class ScanService {
  private readonly file = inject(FilesService);
  private readonly app = inject(AppService);
  private readonly cache = inject(CacheService);

  isScanning$ = new BehaviorSubject(false);
  currentScanningFile$ = new BehaviorSubject<string | undefined>(undefined);
  itemsUpdated$ = new Subject<void>();
  itemAdded$ = new Subject<ImageItem>();
  itemRemoved$ = new Subject<string>();
  scannedCount$ = new BehaviorSubject<number>(0);
  watchingCount$ = new BehaviorSubject<number>(0);
  progress$ = combineLatest({ scanned: this.scannedCount$, total: this.watchingCount$ }).pipe(
    map((state) => state.scanned / state.total),
  );
  progressCompleted$ = combineLatest({ scanned: this.scannedCount$, total: this.watchingCount$ }).pipe(
    filter((state) => !!state.scanned && !!state.total && state.scanned === state.total),
  )

  private _stopScanning?: () => void;
  private subs = new Subscription();

  async checkExistence() {
    const cacheState = this.cache.state;
    for(const path of cacheState.scanned) {
      const exists = await this.file.exists(path);
      if (!exists) {
        this.cache.removeFromScanned(path);
        db$.remove(path);
      }
    }
  }

  async startScan(force?: boolean) {
    const appState = this.app.state;
    const cacheState = this.cache.state;
    if (!appState.settings.dirs.length) {
      console.warn('No directory is selected to scan');
      return;
    }
    if (force && this.isScanning$.value) {
      this.stopScan();
    } else if (this.isScanning$.value) {
      return;
    }

    await this.checkExistence();

    this.isScanning$.next(true);

    const watcher = this.file.watch(appState.settings.dirs)
    this.subs = new Subscription();
    this.subs.add(watcher.state.subscribe((state) => {
      if (!state.latest?.endsWith('.png') && !state.latest?.endsWith('.jpg') && !state.latest?.endsWith('.jpeg')) return;
      if (state.latest && state.latestAction === 'add' && !cacheState.scanned.includes(state.latest)) {
        this.addToWatchingCount(1);
        const image = new ImageItem(state.latest);
        db$.addImageEntry(image).then(() => {
          this.cache.addToScanned(state.latest!);
          cacheState.scanned.push(state.latest!);
          this.currentScanningFile$.next(state.latest)
          this.itemsUpdated$.next();
          this.itemAdded$.next(image);
          this.addToScanningCount(1);
        }).catch(err => {
          if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
            this.cache.addToScanned(state.latest!);
            cacheState.scanned.push(state.latest!);
            this.addToScanningCount(1);
          }
        });
      } else if (state.latest && state.latestAction === 'remove' && cacheState.scanned.includes(state.latest)) {
        this.addToWatchingCount(-1);
        db$.remove(state.latest!).then(() => {
          this.cache.removeFromScanned(state.latest!);
          const index = cacheState.scanned.indexOf(state.latest!);
          index !== -1 ? cacheState.scanned.splice(index, 1) : null;
          this.currentScanningFile$.next(state.latest)
          this.itemsUpdated$.next();
          this.itemRemoved$.next(state.latest!);
          this.addToScanningCount(-1);
        })
      }
    }))
    this.subs.add(this.itemsUpdated$.pipe(debounceTime(1000)).subscribe(() => {
      this.currentScanningFile$.next(undefined)
    }))
    this._stopScanning = watcher.unwatch;
  }

  stopScan() {
    this.isScanning$.next(false);
    this.subs.unsubscribe();
    this._stopScanning?.();
  }

  private addToWatchingCount(amount: number) {
    this.watchingCount$.next(this.watchingCount$.value+amount);
  }
  private addToScanningCount(amount: number) {
    this.scannedCount$.next(this.scannedCount$.value+amount);
  }
}
