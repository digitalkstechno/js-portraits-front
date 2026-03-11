import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintsettingsComponent } from './printsettings.component';

describe('PrintsettingsComponent', () => {
  let component: PrintsettingsComponent;
  let fixture: ComponentFixture<PrintsettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintsettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintsettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
