import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageActionsComponent } from './image-actions.component';

describe('ImageActionsComponent', () => {
  let component: ImageActionsComponent;
  let fixture: ComponentFixture<ImageActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageActionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImageActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
