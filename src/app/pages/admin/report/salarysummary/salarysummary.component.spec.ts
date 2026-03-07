import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalarysummaryComponent } from './salarysummary.component';

describe('SalarysummaryComponent', () => {
  let component: SalarysummaryComponent;
  let fixture: ComponentFixture<SalarysummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalarysummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalarysummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
