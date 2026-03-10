import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationprintComponent } from './quotationprint.component';

describe('QuotationprintComponent', () => {
  let component: QuotationprintComponent;
  let fixture: ComponentFixture<QuotationprintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotationprintComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationprintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
