import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-staffentry',
  imports: [],
  templateUrl: './staffentry.component.html',
  styleUrl: './staffentry.component.css',
})
export class StaffentryComponent {
  router = inject(Router);

  close() {
    this.router.navigateByUrl('/admin');
  }
}
