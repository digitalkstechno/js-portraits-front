import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtdoorbookmasterComponent } from './otdoorbookmaster.component';

describe('OtdoorbookmasterComponent', () => {
  let component: OtdoorbookmasterComponent;
  let fixture: ComponentFixture<OtdoorbookmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtdoorbookmasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtdoorbookmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
