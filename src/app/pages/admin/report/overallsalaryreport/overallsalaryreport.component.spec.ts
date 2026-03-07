import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverallsalaryreportComponent } from './overallsalaryreport.component';

describe('OverallsalaryreportComponent', () => {
  let component: OverallsalaryreportComponent;
  let fixture: ComponentFixture<OverallsalaryreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverallsalaryreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverallsalaryreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
