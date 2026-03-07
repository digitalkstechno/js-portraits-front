import { Component, ElementRef, HostListener, inject, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { SHARED_MODULES } from '../../constants/sharedModule';
import { Router } from '@angular/router';
import { LoginService } from '../../authentication/service/login.service';

interface MenuChild {
  label: string;
  link: string;
}

interface MenuItem {
  key: string; // unique for dropdowns
  label: string;
  link?: string; // for simple nav items
  children?: MenuChild[]; // for dropdowns
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
    { key: 'transaction', label: 'Transaction', link: '/transaction' },
    { key: 'officer', label: 'Officer', link: '/officer' },
    { key: 'purchase', label: 'New Purchase', link: '/purchase' },
    { key: 'discount', label: 'Discount', link: '/discount' },
    { key: 'booking', label: 'Booking Form', link: '/booking' },
    { key: 'sms', label: 'SMS', link: '/sms' },
    { key: 'utility', label: 'Utility', link: '/utility' },
    { key: 'facebook', label: 'Facebook', link: '/facebook' },
    {
      key: 'report',
      label: 'Report',
      children: [{ label: 'Summary', link: '/admin/summary' }],
    },
    { key: 'cheque', label: 'Cheque', link: '/cheque' },
    { key: 'sheet', label: 'Sheet', link: '/sheet' },
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

  // close any open dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.openMenuKey) return;

    const target = event.target as HTMLElement;
    const clickedInside = this.menuRefs.some((ref: any) =>
      ref.nativeElement.contains(target),
    );

    if (!clickedInside) {
      this.closeAll();
    }
  }
}
