import { Component } from '@angular/core';
import { AdminsidebarComponent } from '../adminsidebar/adminsidebar.component';
import { RouterOutlet } from '@angular/router';
import { AdminheaderComponent } from "../adminheader/adminheader.component";

@Component({
  selector: 'app-adminlayout',
  imports: [AdminsidebarComponent, RouterOutlet, AdminheaderComponent],
  templateUrl: './adminlayout.component.html',
  styleUrl: './adminlayout.component.css',
})
export class AdminlayoutComponent {
  isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
