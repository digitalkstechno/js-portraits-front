import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { AdminService } from '../../components/service/admin.service';
import { forkJoin } from 'rxjs';

Chart.register(...registerables);

// outdoor-report.models.ts
export interface OutdoorOrderItem {
  productId: string;
  itemName: string;
  eventName?: string;
  qty: number;
  rate: number;
  total: number;
}

export interface OutdoorOrder {
  _id: string;
  orderNo: string;
  date: string; // ISO
  outdoorParty: string;
  subTotal: number;
  discount: number;
  advance: number;
  grandTotal: number;
}

export interface OutdoorBillItem {
  productId: string;
  itemName: string;
  qty: number;
  rate: number;
  total: number;
}

export interface OutdoorBill {
  _id: string;
  billNo: string;
  date: string;
  outdoorParty: string;
  subTotal: number;
  discount: number;
  grandTotal: number;
  advance: number;
  balance: number;
  paymentStatus: string;
}

@Component({
  selector: 'app-outdoororderbillreport',
  imports: [SHARED_MODULES],
  templateUrl: './outdoororderbillreport.component.html',
  styleUrl: './outdoororderbillreport.component.css',
})
export class OutdoororderbillreportComponent {
  @ViewChild('revenueChartCanvas')
  revenueChartCanvas!: ElementRef<HTMLCanvasElement>;
  outdoorOrders: any[] = [];
  outdoorBills: any[] = [];
  totalOrderAmount = 0;
  totalBilledAmount = 0;
  totalPending = 0;
  // table rows: merge order + bill
  revenueRows: {
    date: string;
    party: string;
    orderNo: string;
    billNo: string;
    orderAmount: number;
    billedAmount: number;
    pending: number;
    paymentStatus: string;
  }[] = [];

  outdoorService = inject(AdminService);

  ngOnInit() {
    this.loadAllData();
  }

  loadOrders() {
    this.outdoorService.getOutdoorOrder().subscribe((res) => {
      this.outdoorOrders = res.orders;
      console.log(this.outdoorOrders);
    });
  }

  loadBills() {
    this.outdoorService.getOutdoorBill().subscribe((res) => {
      this.outdoorBills = res.bills;
      console.log(this.outdoorBills);
    });
  }

  ngAfterViewInit(): void {}

  loadAllData() {
    forkJoin({
      ordersRes: this.outdoorService.getOutdoorOrder(),
      billsRes: this.outdoorService.getOutdoorBill(),
    }).subscribe(({ ordersRes, billsRes }) => {
      // API response structure के हिसाब से डेटा निकालें
      this.outdoorOrders = ordersRes.orders || ordersRes || [];
      this.outdoorBills = billsRes.bills || billsRes || [];

      console.log('orders', this.outdoorOrders);
      console.log('bills', this.outdoorBills);

      this.buildAggregates();
      // चार्ट बनाने से पहले थोड़ा समय दें ताकि Canvas DOM में रेंडर हो जाए
      setTimeout(() => this.buildRevenueChart(), 100);
    });
  }

  private buildAggregates() {
    console.log('Processing Aggregates...');

    this.revenueRows = this.outdoorOrders.map((order) => {
      // मिलान के लिए नाम का इस्तेमाल करें क्योंकि quotationNo बिल में नहीं है
      const orderPartyName = (order.outdoorParty || '').trim().toLowerCase();

      // बिल ढूंढें - यहाँ हमने Date matching हटा दी है क्योंकि वो मैच नहीं हो रही
      const bill = this.outdoorBills.find((b) => {
        const billPartyName = (b.outdoorParty || '').trim().toLowerCase();
        // अगर पार्टी का नाम "Ravi" (Order) === "Ravi" (Bill) है
        return billPartyName !== '' && billPartyName === orderPartyName;
      });

      if (bill) {
        console.log(
          `Matched Order ${order.orderNo} with Bill ${bill.billNo} for ${order.outdoorParty}`,
        );
      }

      const billedAmt = Number(bill?.grandTotal || 0);
      const advanceReceived = Number(bill?.advance || 0);
      // Pending = बिल की कुल राशि - एडवांस
      const pendingAmt = billedAmt - advanceReceived;

      return {
        date: new Date(order.date).toLocaleDateString('en-GB'),
        party: order.outdoorParty || 'Customer 1', // अगर नाम नहीं है तो Default
        orderNo: order.orderNo,
        billNo: bill?.billNo || '-',
        orderAmount: Number(order.grandTotal || 0),
        billedAmount: billedAmt,
        pending: pendingAmt > 0 ? pendingAmt : 0,
        paymentStatus: bill?.paymentStatus || 'Pending',
      };
    });

    // Totals अपडेट करें
    this.updateTotals();
  }

  private updateTotals() {
    this.totalOrderAmount = this.revenueRows.reduce(
      (sum, r) => sum + r.orderAmount,
      0,
    );
    this.totalBilledAmount = this.revenueRows.reduce(
      (sum, r) => sum + r.billedAmount,
      0,
    );
    this.totalPending = this.revenueRows.reduce((sum, r) => sum + r.pending, 0);
  }

  chartInstance: any;
  private buildRevenueChart() {
    const canvas = this.revenueChartCanvas?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    // group revenue by date
    const revenueByDate = new Map<string, number>();
    this.revenueRows.forEach((row) => {
      const key = row.date;
      const existing = revenueByDate.get(key) ?? 0;
      revenueByDate.set(key, existing + row.billedAmount);
    });

    const labels = Array.from(revenueByDate.keys()).sort();
    const values = labels.map((d) => revenueByDate.get(d) ?? 0);

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue (₹)',
            data: values,
            backgroundColor: '#4f46e5',
            borderRadius: 6,
            maxBarThickness: 48,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true },
          tooltip: {
            callbacks: {
              label: (context) =>
                ` ₹${(context.parsed.y ?? 0).toLocaleString('en-IN')}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            grid: { color: '#e5e7eb' },
          },
        },
      },
    };

    this.chartInstance = new Chart(ctx, config);
  }

  private toDate(iso: string): string {
    if (!iso) return 'null';
    const d = new Date(iso);
    // समय को पूरी तरह नज़रअंदाज़ करें, सिर्फ तारीख की तुलना करें
    return `${d.getUTCDate()}-${d.getUTCMonth() + 1}-${d.getUTCFullYear()}`;
  }
}
