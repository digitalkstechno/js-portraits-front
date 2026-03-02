import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SHARED_MODULES } from '../../constants/sharedModule';

@Component({
  selector: 'app-adminsidebar',
  imports: [SHARED_MODULES],
  templateUrl: './adminsidebar.component.html',
  styleUrl: './adminsidebar.component.css',
})
export class AdminsidebarComponent {
  @Input() collapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  onToggle() {
    this.toggleSidebar.emit();
  }
}
