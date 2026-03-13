import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemspurchaseComponent } from './itemspurchase.component';

describe('ItemspurchaseComponent', () => {
  let component: ItemspurchaseComponent;
  let fixture: ComponentFixture<ItemspurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemspurchaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemspurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
