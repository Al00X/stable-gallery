import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewOptionsFormComponent } from './view-options-form.component';

describe('ViewOptionsFormComponent', () => {
  let component: ViewOptionsFormComponent;
  let fixture: ComponentFixture<ViewOptionsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewOptionsFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewOptionsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
