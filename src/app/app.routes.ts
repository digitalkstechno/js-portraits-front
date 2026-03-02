import { Routes } from '@angular/router';
import { AdminlayoutComponent } from './admin/adminlayout/adminlayout.component';

export const routes: Routes = [
  {
    path: '',
    component: AdminlayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
    ],
  },
];
