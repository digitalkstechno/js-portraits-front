import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesettingsComponent } from './notesettings.component';

describe('NotesettingsComponent', () => {
  let component: NotesettingsComponent;
  let fixture: ComponentFixture<NotesettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotesettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotesettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
