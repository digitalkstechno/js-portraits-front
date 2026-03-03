import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SHARED_MODULES } from '../../../../constants/sharedModule';

@Component({
  selector: 'app-itemmaster',
  imports: [SHARED_MODULES],
  templateUrl: './itemmaster.component.html',
  styleUrl: './itemmaster.component.css',
})
export class ItemmasterComponent {
  itemForm!: FormGroup;
  items = [
    { name: 'ALBUM', hsn: '0' },
    { name: 'CANVAS', hsn: '0' },
    { name: 'LAMINATION', hsn: '0' },
    { name: 'PHOTOGRAPHY', hsn: '0' },
    { name: 'VIDEO SHOOT', hsn: '0' },
  ];

  constructor(private fb: FormBuilder) {
    this.itemForm = fb.group({
      item_name: [''],
      hsn_code: [''],
      display_in_stock: [''],
      entry_by: [''],
      updated_by: [''],
    });
  }

  ngOnInit(){}

  onSubmit(){}
}
