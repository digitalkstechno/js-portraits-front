import { Routes } from '@angular/router';
import { AdminlayoutComponent } from './admin/adminlayout/adminlayout.component';
import { guardGuard } from './authentication/guard/guard.guard';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminlayoutComponent,
    canActivate: [guardGuard],
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
        path: 'outdoor/order',
        loadComponent: () =>
          import('./pages/admin/components/outdoororder/outdoororder.component').then(
            (m) => m.OutdoororderComponent,
          ),
      },
      {
        path: 'outdoor/bill',
        loadComponent: () =>
          import('./pages/admin/components/outdoorbill/outdoorbill.component').then(
            (m) => m.OutdoorbillComponent,
          ),
      },
      {
        path: 'outdoor/payment',
        loadComponent: () =>
          import('./pages/admin/components/outdoorpartypayment/outdoorpartypayment.component').then(
            (m) => m.OutdoorpartypaymentComponent,
          ),
      },
      {
        path: 'staff/entry',
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
        path: 'product/sell',
        loadComponent: () =>
          import('./pages/admin/components/purchaseitems/purchaseitems.component').then(
            (m) => m.PurchaseitemsComponent,
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
      {
        path: 'salary/overall-report',
        loadComponent: () =>
          import('./pages/admin/report/overallsalaryreport/overallsalaryreport.component').then(
            (m) => m.OverallsalaryreportComponent,
          ),
      },
      {
        path: 'salary/individual-report',
        loadComponent: () =>
          import('./pages/admin/report/staffwisesalaryreport/staffwisesalaryreport.component').then(
            (m) => m.StaffwisesalaryreportComponent,
          ),
      },
      {
        path: 'payments/report',
        loadComponent: () =>
          import('./pages/admin/report/pendingpaymentsreport/pendingpaymentsreport.component').then(
            (m) => m.PendingpaymentsreportComponent,
          ),
      },
      {
        path: 'note-settings',
        loadComponent: () =>
          import('./pages/admin/components/notesettings/notesettings.component').then(
            (m) => m.NotesettingsComponent,
          ),
      },
      {
        path: 'outdoor/book-master',
        loadComponent: () =>
          import('./pages/admin/master/otdoorbookmaster/otdoorbookmaster.component').then(
            (m) => m.OtdoorbookmasterComponent,
          ),
      },
      {
        path: 'terms&conditions',
        loadComponent: () =>
          import('./pages/admin/components/terms/termsandconditions/termsandconditions.component').then(
            (m) => m.TermsandconditionsComponent,
          ),
        children: [
          {
            path: 'show',
            loadComponent: () =>
              import('./pages/admin/components/terms/showtermsandconditions/showtermsandconditions.component').then(
                (m) => m.ShowtermsandconditionsComponent,
              ),
          },
        ],
      },
      {
        path: 'gst/config',
        loadComponent: () =>
          import('./pages/admin/components/gstconfiguration/gstconfiguration.component').then(
            (m) => m.GstconfigurationComponent,
          ),
      },
      {
        path: 'print/settings',
        loadComponent: () =>
          import('./pages/admin/components/settings/printsettings/printsettings.component').then(
            (m) => m.PrintsettingsComponent,
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
