import { Component, ElementRef, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { SHARED_MODULES } from '../../../../constants/sharedModule';

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
  date: string;           // ISO
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

  // mock data – replace with API calls
  outdoorOrders = [
    {
      _id: '69aba84f3958c3e86992b7c9',
      orderNo: '2',
      date: '2026-03-05T00:00:00.000Z',
      outdoorParty: 'praveen',
      subTotal: 2500,
      discount: 0,
      advance: 0,
      grandTotal: 2500,
    },
  ];

  outdoorBills = [
    {
      _id: '69aba9fb02e21635dc5576e6',
      billNo: '1',
      date: '2026-03-05T00:00:00.000Z',
      outdoorParty: 'praveen',
      subTotal: 2500,
      discount: 0,
      grandTotal: 2500,
      advance: 0,
      balance: 2500,
      paymentStatus: 'Pending',
    },
  ];

  // derived totals for cards/table
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

  ngAfterViewInit(): void {
    this.buildAggregates();
    this.buildRevenueChart();
  }

  private buildAggregates() {
    // For real app: group by party+date or by orderId; here we only have 1–1
    this.revenueRows = this.outdoorOrders.map((order) => {
      const bill = this.outdoorBills.find(
        (b) =>
          b.outdoorParty === order.outdoorParty &&
          this.toDate(b.date) === this.toDate(order.date),
      );

      const billedAmt = bill?.grandTotal ?? 0;
      const pending = billedAmt - (bill?.advance ?? 0);

      return {
        date: this.toDate(order.date),
        party: order.outdoorParty,
        orderNo: order.orderNo,
        billNo: bill?.billNo ?? '-',
        orderAmount: order.grandTotal,
        billedAmount: billedAmt,
        pending,
        paymentStatus: bill?.paymentStatus ?? '-',
      };
    });

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

  private buildRevenueChart() {
    // group revenue by date
    const revenueByDate = new Map<string, number>();
    this.revenueRows.forEach((row) => {
      const key = row.date;
      const existing = revenueByDate.get(key) ?? 0;
      revenueByDate.set(key, existing + row.billedAmount);
    });

    const labels = Array.from(revenueByDate.keys()).sort();
    const values = labels.map((d) => revenueByDate.get(d) ?? 0);

    const ctx = this.revenueChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

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

    new Chart(ctx, config);
  }

  private toDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB'); // 05/03/2026
  }
}
