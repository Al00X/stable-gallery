import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteToggleComponent } from './favorite-toggle.component';

describe('FavoriteToggleComponent', () => {
  let component: FavoriteToggleComponent;
  let fixture: ComponentFixture<FavoriteToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoriteToggleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoriteToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
