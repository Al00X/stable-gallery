import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasonryComponent } from './masonry.component';

describe('MasonryComponent', () => {
  let component: MasonryComponent;
  let fixture: ComponentFixture<MasonryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasonryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MasonryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
