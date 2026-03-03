import { Component } from '@angular/core';
import { SHARED_MODULES } from '../../constants/sharedModule';

@Component({
  selector: 'app-adminheader',
  imports: [SHARED_MODULES],
  templateUrl: './adminheader.component.html',
  styleUrl: './adminheader.component.css',
})
export class AdminheaderComponent {
  isMasterOpen = false;

  toggleMaster() {
    this.isMasterOpen = !this.isMasterOpen;
  }

  closeMaster() {
    this.isMasterOpen = false;
  }
}
