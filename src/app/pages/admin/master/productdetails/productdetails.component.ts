import { Component } from '@angular/core';
import { SHARED_MODULES } from '../../../../constants/sharedModule';

@Component({
  selector: 'app-productdetails',
  imports: [SHARED_MODULES],
  templateUrl: './productdetails.component.html',
  styleUrl: './productdetails.component.css',
})
export class ProductdetailsComponent {
  products = [
    {
      item: 'PHOTOGRAPHY',
      size: 'PHOTO FRAME',
      stock: 0,
      rate: 0,
      total: 0.0,
      billSize: 10,
      prate: 0,
    },
    {
      item: 'PHOTOGRAPHY',
      size: 'PHOTOGRAPHY',
      stock: 0,
      rate: 0,
      total: 0.0,
      billSize: 20,
      prate: 0,
    },
  ];
}
