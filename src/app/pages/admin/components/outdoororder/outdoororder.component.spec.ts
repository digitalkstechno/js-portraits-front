import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutdoororderComponent } from './outdoororder.component';

describe('OutdoororderComponent', () => {
  let component: OutdoororderComponent;
  let fixture: ComponentFixture<OutdoororderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutdoororderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutdoororderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
