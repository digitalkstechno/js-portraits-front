import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-outdoororder',
  imports: [],
  templateUrl: './outdoororder.component.html',
  styleUrl: './outdoororder.component.css',
})
export class OutdoororderComponent {
  router = inject(Router);

  ngOnInit() {}

  onSubmit() {}

  close() {
    this.router.navigateByUrl('/admin');
  }
}
