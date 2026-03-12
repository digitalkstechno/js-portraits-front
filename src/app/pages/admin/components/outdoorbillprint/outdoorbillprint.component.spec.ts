import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutdoorbillprintComponent } from './outdoorbillprint.component';

describe('OutdoorbillprintComponent', () => {
  let component: OutdoorbillprintComponent;
  let fixture: ComponentFixture<OutdoorbillprintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutdoorbillprintComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutdoorbillprintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
