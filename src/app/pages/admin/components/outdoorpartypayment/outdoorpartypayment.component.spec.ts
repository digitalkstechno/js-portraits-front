import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutdoorpartypaymentComponent } from './outdoorpartypayment.component';

describe('OutdoorpartypaymentComponent', () => {
  let component: OutdoorpartypaymentComponent;
  let fixture: ComponentFixture<OutdoorpartypaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutdoorpartypaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutdoorpartypaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
