import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffentryComponent } from './staffentry.component';

describe('StaffentryComponent', () => {
  let component: StaffentryComponent;
  let fixture: ComponentFixture<StaffentryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffentryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffentryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
