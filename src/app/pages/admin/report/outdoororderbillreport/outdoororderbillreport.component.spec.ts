import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutdoororderbillreportComponent } from './outdoororderbillreport.component';

describe('OutdoororderbillreportComponent', () => {
  let component: OutdoororderbillreportComponent;
  let fixture: ComponentFixture<OutdoororderbillreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutdoororderbillreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutdoororderbillreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
