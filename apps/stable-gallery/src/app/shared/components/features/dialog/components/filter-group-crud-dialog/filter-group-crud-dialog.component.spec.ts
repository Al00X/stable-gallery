import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterGroupCrudDialogComponent } from './filter-group-crud-dialog.component';

describe('GroupCrudDialogComponent', () => {
  let component: FilterGroupCrudDialogComponent;
  let fixture: ComponentFixture<FilterGroupCrudDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterGroupCrudDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterGroupCrudDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
