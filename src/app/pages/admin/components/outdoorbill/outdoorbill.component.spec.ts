import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutdoorbillComponent } from './outdoorbill.component';

describe('OutdoorbillComponent', () => {
  let component: OutdoorbillComponent;
  let fixture: ComponentFixture<OutdoorbillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutdoorbillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutdoorbillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
