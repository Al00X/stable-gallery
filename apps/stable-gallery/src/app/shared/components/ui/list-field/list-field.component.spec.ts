import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFieldComponent } from './list-field.component';

describe('ListFieldComponent', () => {
  let component: ListFieldComponent;
  let fixture: ComponentFixture<ListFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
