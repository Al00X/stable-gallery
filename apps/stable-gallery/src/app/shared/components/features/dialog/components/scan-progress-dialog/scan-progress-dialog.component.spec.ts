import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanProgressDialogComponent } from './scan-progress-dialog.component';

describe('ScanProgressDialogComponent', () => {
  let component: ScanProgressDialogComponent;
  let fixture: ComponentFixture<ScanProgressDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanProgressDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScanProgressDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
