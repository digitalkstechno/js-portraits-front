import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseitemsComponent } from './purchaseitems.component';

describe('PurchaseitemsComponent', () => {
  let component: PurchaseitemsComponent;
  let fixture: ComponentFixture<PurchaseitemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseitemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseitemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
