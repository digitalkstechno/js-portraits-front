import { Component, inject } from '@angular/core';
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
  isMasterOpen = false;
  router = inject(Router);
  authService = inject(LoginService);

  toggleMaster() {
    this.isMasterOpen = !this.isMasterOpen;
  }

  closeMaster() {
    this.isMasterOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
