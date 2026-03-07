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
      {
        path: 'outdoor-bill',
        loadComponent: () =>
          import('./pages/admin/components/outdoorbill/outdoorbill.component').then(
            (m) => m.OutdoorbillComponent,
          ),
      },
      {
        path: 'staff',
        loadComponent: () =>
          import('./pages/admin/components/staff-management/staffentry/staffentry.component').then(
            (m) => m.StaffentryComponent,
          ),
      },
      {
        path: 'staff/salary',
        loadComponent: () =>
          import('./pages/admin/components/staff-management/staffsalary/staffsalary.component').then(
            (m) => m.StaffsalaryComponent,
          ),
      },
      {
        path: 'summary',
        loadComponent: () =>
          import('./pages/admin/report/summary/summary.component').then(
            (m) => m.SummaryComponent,
          ),
      },
      {
        path: 'order/report',
        loadComponent: () =>
          import('./pages/admin/report/outdoororderbillreport/outdoororderbillreport.component').then(
            (m) => m.OutdoororderbillreportComponent,
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
