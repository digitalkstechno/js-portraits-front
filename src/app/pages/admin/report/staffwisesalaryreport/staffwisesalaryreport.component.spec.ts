import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffwisesalaryreportComponent } from './staffwisesalaryreport.component';

describe('StaffwisesalaryreportComponent', () => {
  let component: StaffwisesalaryreportComponent;
  let fixture: ComponentFixture<StaffwisesalaryreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffwisesalaryreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffwisesalaryreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
