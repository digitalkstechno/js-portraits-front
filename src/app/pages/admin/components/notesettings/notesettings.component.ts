import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { AdminService } from '../service/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notesettings',
  imports: [SHARED_MODULES],
  templateUrl: './notesettings.component.html',
  styleUrl: './notesettings.component.css',
})
export class NotesettingsComponent {
  settingsForm!: FormGroup;
  noteService = inject(AdminService);
  router = inject(Router);
  quotationNote: any;
  orderNote: any;
  billNote: any;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadNotes();

    this.settingsForm = this.fb.group({
      quotationNote: [this.quotationNote],
      orderNote: [this.orderNote],
      billNote: [this.billNote],
      entryBy: [''],
      updateBy: ['jsp'],
    });
  }

  loadNotes() {
    this.noteService.getNotes().subscribe((res) => {
      console.log(res[0]);
      const notes = res[0];
      this.settingsForm.patchValue({
        quotationNote: notes.quotationNote,
        orderNote: notes.orderNote,
        billNote: notes.billNote,
      });
    });
  }

  onSubmit() {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    const formValue = this.settingsForm.value;

    this.noteService.createNoteSettings(formValue).subscribe({
      next: (res: any) => {
        alert('Notes Created Successfully');
      },
      error: (err: any) => {
        console.error('Error creating notes', err);
        alert('Something went wrong while saving bill');
      },
    });
  }

  onExit() {
    this.router.navigateByUrl('/admin');
  }
}
