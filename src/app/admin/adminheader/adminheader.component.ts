import { Component, ElementRef, HostListener, inject, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { SHARED_MODULES } from '../../constants/sharedModule';
import { Router } from '@angular/router';
import { LoginService } from '../../authentication/service/login.service';

interface MenuChild {
  label: string;
  link?: string; // Made optional because parent nodes (like Summary) might not have a link
  key?: string;
  children?: MenuChild[]; // Recursive definition
}

interface MenuItem {
  key: string;
  label: string;
  link?: string;
  children?: MenuChild[];
  action?: 'logout' | 'exit';
}
@Component({
  selector: 'app-adminheader',
  imports: [SHARED_MODULES],
  templateUrl: './adminheader.component.html',
  styleUrl: './adminheader.component.css',
})
export class AdminheaderComponent {
  router = inject(Router);
  authService = inject(LoginService);

  // only one state variable for ALL dropdowns
  openMenuKey: string | null = null;

  // menu definition – add/remove items here only
  menuItems: MenuItem[] = [
    {
      key: 'master',
      label: 'Master',
      children: [
        { label: 'Item Master', link: '/admin/items' },
        { label: 'Product Master', link: '/admin/products' },
        { label: 'Package Master', link: '/package-master' },
      ],
    },
    { key: 'transaction', label: 'Transaction' },
    { key: 'officer', label: 'Officer' },
    { key: 'purchase', label: 'New Purchase' },
    { key: 'discount', label: 'Discount' },
    { key: 'booking', label: 'Booking Form' },
    { key: 'sms', label: 'SMS' },
    { key: 'utility', label: 'Utility' },
    { key: 'facebook', label: 'Facebook' },
    {
      key: 'report',
      label: 'Report',
      children: [
        {
          label: 'Summary',
          key: 'summary', // Nested key
          children: [
            { label: 'Outdoor Order Revenue', link: '/admin/order/report' },
            { label: 'Outdoor Bill Revenue', link: '/reports/outdoor-bill' },
            { label: 'Individual Employee', link: '/admin/salary/individual-report' },
            { label: 'Overall Salary', link: '/admin/salary/overall-report' },
          ],
        },
      ],
    },
    { key: 'cheque', label: 'Cheque' },
    { key: 'sheet', label: 'Sheet' },
    { key: 'logoff', label: 'Log Off', action: 'logout' },
    { key: 'exit', label: 'Exit', action: 'exit' },
  ];

  // references to all dropdown containers
  @ViewChildren('menuRef') menuRefs!: QueryList<ElementRef<HTMLElement>>;

  toggleMenu(key: string) {
    this.openMenuKey = this.openMenuKey === key ? null : key;
  }

  closeAll() {
    this.openMenuKey = null;
  }

  onAction(action: 'logout' | 'exit') {
    if (action === 'logout' || action === 'exit') {
      this.logout();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.openMenuKey) return;
    const target = event.target as HTMLElement;

    // Check if the click was inside any of the dropdown containers
    const clickedInside = this.menuRefs.some((ref) =>
      ref.nativeElement.contains(target),
    );

    if (!clickedInside) {
      this.closeAll();
    }
  }
}
