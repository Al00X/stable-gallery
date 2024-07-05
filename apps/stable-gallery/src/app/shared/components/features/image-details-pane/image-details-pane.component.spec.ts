import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageDetailsPaneComponent } from './image-details-pane.component';

describe('ImageDetailsPaneComponent', () => {
  let component: ImageDetailsPaneComponent;
  let fixture: ComponentFixture<ImageDetailsPaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageDetailsPaneComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImageDetailsPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
