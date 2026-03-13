import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItempurchaselistComponent } from './itempurchaselist.component';

describe('ItempurchaselistComponent', () => {
  let component: ItempurchaselistComponent;
  let fixture: ComponentFixture<ItempurchaselistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItempurchaselistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItempurchaselistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
