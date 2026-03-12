import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutdoororderprintComponent } from './outdoororderprint.component';

describe('OutdoororderprintComponent', () => {
  let component: OutdoororderprintComponent;
  let fixture: ComponentFixture<OutdoororderprintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutdoororderprintComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutdoororderprintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
