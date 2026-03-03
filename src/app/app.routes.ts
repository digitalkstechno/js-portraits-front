import { Routes } from '@angular/router';
import { AdminlayoutComponent } from './admin/adminlayout/adminlayout.component';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminlayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'items',
        loadComponent: () =>
          import('./pages/admin/master/itemmaster/itemmaster.component').then(
            (m) => m.ItemmasterComponent,
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/admin/master/productdetails/productdetails.component').then(
            (m) => m.ProductdetailsComponent,
          ),
      },
      {
        path: 'quotation',
        loadComponent: () =>
          import('./pages/admin/components/quotation/quotation.component').then(
            (m) => m.QuotationComponent,
          ),
      },
      {
        path: 'outdoor-order',
        loadComponent: () =>
          import('./pages/admin/components/outdoororder/outdoororder.component').then(
            (m) => m.OutdoororderComponent,
          ),
      },
    ],
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./authentication/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  { path: '**', redirectTo: 'login' },
];
