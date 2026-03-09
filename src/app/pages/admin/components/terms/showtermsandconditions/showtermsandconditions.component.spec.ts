import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowtermsandconditionsComponent } from './showtermsandconditions.component';

describe('ShowtermsandconditionsComponent', () => {
  let component: ShowtermsandconditionsComponent;
  let fixture: ComponentFixture<ShowtermsandconditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowtermsandconditionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowtermsandconditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
