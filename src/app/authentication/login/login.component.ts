import { Component } from '@angular/core';
import { SHARED_MODULES } from '../../constants/sharedModule';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../service/login.service';

@Component({
  selector: 'app-login',
  imports: [SHARED_MODULES],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: LoginService,
  ) {
    this.loginForm = this.fb.group({
      company: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  get f() {
    return this.loginForm.controls as {
      email: any;
      password: any;
    };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    const payload = this.loginForm.value;

    this.authService.login(payload).subscribe({
      next: (res) => {
        const user = res.user;
        // console.log('Response', res);
        this.router.navigate(['/dashboard']);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Invalid credentials');
      },
    });
  }
}
