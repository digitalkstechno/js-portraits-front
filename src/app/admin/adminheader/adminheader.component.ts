import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { SHARED_MODULES } from '../../constants/sharedModule';
import { Router } from '@angular/router';
import { LoginService } from '../../authentication/service/login.service';

@Component({
  selector: 'app-adminheader',
  imports: [SHARED_MODULES],
  templateUrl: './adminheader.component.html',
  styleUrl: './adminheader.component.css',
})
export class AdminheaderComponent {
  // dropdown states
  isMasterOpen = false;
  isReportOpen = false;

  router = inject(Router);
  authService = inject(LoginService);

  @ViewChild('masterMenu', { static: true }) masterMenu!: ElementRef;
  @ViewChild('reportMenu', { static: true }) reportMenu!: ElementRef;

  /** Open one menu and close the others */
  toggleMenu(menu: 'master' | 'report') {
    if (menu === 'master') {
      this.isMasterOpen = !this.isMasterOpen;
      if (this.isMasterOpen) this.isReportOpen = false;
    } else if (menu === 'report') {
      this.isReportOpen = !this.isReportOpen;
      if (this.isReportOpen) this.isMasterOpen = false;
    }
  }

  closeAll() {
    this.isMasterOpen = false;
    this.isReportOpen = false;
  }

  /** Close all dropdowns when clicking outside any menu */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const clickedInsideMaster = this.masterMenu?.nativeElement.contains(target);
    const clickedInsideReport = this.reportMenu?.nativeElement.contains(target);

    if (!clickedInsideMaster && !clickedInsideReport) {
      this.closeAll();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
