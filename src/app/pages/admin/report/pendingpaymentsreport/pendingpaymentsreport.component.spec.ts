import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingpaymentsreportComponent } from './pendingpaymentsreport.component';

describe('PendingpaymentsreportComponent', () => {
  let component: PendingpaymentsreportComponent;
  let fixture: ComponentFixture<PendingpaymentsreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingpaymentsreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingpaymentsreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
