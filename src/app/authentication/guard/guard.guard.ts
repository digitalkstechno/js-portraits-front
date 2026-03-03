import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../service/login.service';

export const guardGuard: CanActivateFn = (route, state) => {
 const router = inject(Router);
 const authService = inject(LoginService);
 const token = localStorage.getItem('token');

 if (token) {
   return true;
 }

 if (!authService.isLoggedIn()) {
   router.navigate(['/login']);
   return false;
 }

 return false;
};
