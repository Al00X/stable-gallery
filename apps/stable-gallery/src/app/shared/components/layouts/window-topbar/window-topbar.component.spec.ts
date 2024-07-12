import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WindowTopbarComponent } from './window-topbar.component';

describe('WindowTopbarComponent', () => {
  let component: WindowTopbarComponent;
  let fixture: ComponentFixture<WindowTopbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WindowTopbarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WindowTopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
