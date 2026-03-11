import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GstconfigurationComponent } from './gstconfiguration.component';

describe('GstconfigurationComponent', () => {
  let component: GstconfigurationComponent;
  let fixture: ComponentFixture<GstconfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GstconfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GstconfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
