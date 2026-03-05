import { Component, inject } from '@angular/core';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { Router } from '@angular/router';

@Component({
  selector: 'app-outdoorbill',
  imports: [SHARED_MODULES],
  templateUrl: './outdoorbill.component.html',
  styleUrl: './outdoorbill.component.css',
})
export class OutdoorbillComponent {
  router = inject(Router);
  items = [
    { date: 'ALBUM', hsn: '0' },
    { name: 'ALBUM', hsn: '0' },
    { size: 'CANVAS', hsn: '0' },
    { event: 'CANVAS', hsn: '0' },
    { qty: 'LAMINATION', hsn: '0' },
    { rate: 'PHOTOGRAPHY', hsn: '0' },
    { amount: 'VIDEO SHOOT', hsn: '0' },
  ];

  ngOnInit() {}

  onSubmit() {}

  close() {
    this.router.navigateByUrl('/admin');
  }
}
