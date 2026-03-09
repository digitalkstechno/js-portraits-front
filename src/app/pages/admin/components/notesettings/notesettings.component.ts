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
      const notes = res[0];
      // console.log(res[0]);
      this.settingsForm.patchValue({
        quotationNote: notes.quotationNote,
        orderNote: notes.orderNote,
        billNote: notes.billNote,
        entryBy: notes.entryBy,
        updateBy: notes.updateBy,
      });
    });
  }

  showPopup = false;
  popupMessage = '';
  isError = false;

  onSubmit() {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    const formValue = this.settingsForm.value;

    this.noteService.createNoteSettings(formValue).subscribe({
      next: (res: any) => {
        this.triggerPopup('Settings Saved Successfully!', false);
        this.loadNotes();
      },
      error: (err: any) => {
        console.error('Error saving notes', err);
        this.triggerPopup('Something went wrong while saving!', true);
      },
    });
  }

  // Pop-up handle karne ka function
  triggerPopup(message: string, error: boolean) {
    this.popupMessage = message;
    this.isError = error;
    this.showPopup = true;

    // 3 second baad apne aap gayab ho jayega
    setTimeout(() => {
      this.showPopup = false;
    }, 3000);
  }

  onExit() {
    this.router.navigateByUrl('/admin');
  }
}
