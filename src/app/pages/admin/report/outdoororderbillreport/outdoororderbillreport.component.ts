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
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef<HTMLCanvasElement>;
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
      setTimeout(() => {
        this.buildRevenueChart();
        this.buildLineChart();
        this.buildPieChart();
      }, 100);
    });
  }

  // private buildAggregates() {
  //   console.log('Processing Aggregates...');

  //   this.revenueRows = this.outdoorOrders.map((order) => {
  //     // मिलान के लिए नाम का इस्तेमाल करें क्योंकि quotationNo बिल में नहीं है
  //     const orderPartyName = (order.outdoorParty || '').trim().toLowerCase();

  //     // बिल ढूंढें - यहाँ हमने Date matching हटा दी है क्योंकि वो मैच नहीं हो रही
  //     const bill = this.outdoorBills.find((b) => {
  //       const billPartyName = (b.outdoorParty || '').trim().toLowerCase();
  //       // अगर पार्टी का नाम "Ravi" (Order) === "Ravi" (Bill) है
  //       return billPartyName !== '' && billPartyName === orderPartyName;
  //     });

  //     if (bill) {
  //       console.log(
  //         `Matched Order ${order.orderNo} with Bill ${bill.billNo} for ${order.outdoorParty}`,
  //       );
  //     }

  //     const billedAmt = Number(bill?.grandTotal || 0);
  //     const advanceReceived = Number(bill?.advance || 0);
  //     // Pending = बिल की कुल राशि - एडवांस
  //     const pendingAmt = billedAmt - advanceReceived;

  //     return {
  //       date: new Date(order.date).toLocaleDateString('en-GB'),
  //       party: order.outdoorParty || 'Customer 1', // अगर नाम नहीं है तो Default
  //       orderNo: order.orderNo,
  //       billNo: bill?.billNo || '-',
  //       orderAmount: Number(order.grandTotal || 0),
  //       billedAmount: billedAmt,
  //       pending: pendingAmt > 0 ? pendingAmt : 0,
  //       paymentStatus: bill?.paymentStatus || 'Pending',
  //     };
  //   });

  //   // Totals अपडेट करें
  //   this.updateTotals();
  // }

  // Variables for Summary
  totalOrderPending = 0;
  totalBillPending = 0;

  private buildAggregates() {
    // 1. Order Calculations
    this.totalOrderAmount = 0;
    this.totalOrderPending = 0;

    this.outdoorOrders.forEach((order) => {
      const total = Number(order.grandTotal || 0);
      const adv = Number(order.advance || 0);
      this.totalOrderAmount += total;
      this.totalOrderPending += total - adv;
    });

    // 2. Bill Calculations
    this.totalBilledAmount = 0;
    this.totalBillPending = 0;

    this.outdoorBills.forEach((bill) => {
      const total = Number(bill.grandTotal || 0);
      const adv = Number(bill.advance || 0);
      this.totalBilledAmount += total;
      this.totalBillPending += total - adv;
    });
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


  // --- 1. Line/Dot Chart (Revenue Trend) ---
  private buildLineChart() {
    const ctx = this.lineChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const dateLabels = Array.from(
      new Set(this.outdoorBills.map((b) => this.toDate(b.date))),
    ).sort();
    const trendData = dateLabels.map((d) =>
      this.outdoorBills
        .filter((b) => this.toDate(b.date) === d)
        .reduce((s, b) => s + Number(b.grandTotal), 0),
    );

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: dateLabels,
        datasets: [
          {
            label: 'Daily Revenue',
            data: trendData,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: '#fff',
            pointBorderWidth: 2,
          },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });
  }

  // --- 2. Pie Chart (Payment Status Distribution) ---
  private buildPieChart() {
    const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const statusCounts = {
      Paid: this.outdoorBills.filter((b) => b.paymentStatus === 'Paid').length,
      Partial: this.outdoorBills.filter((b) => b.paymentStatus === 'Partial')
        .length,
      Pending: this.outdoorBills.filter((b) => b.paymentStatus === 'Pending')
        .length,
    };

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Paid', 'Partial', 'Pending'],
        datasets: [
          {
            data: [
              statusCounts.Paid,
              statusCounts.Partial,
              statusCounts.Pending,
            ],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            hoverOffset: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  }

  chartInstance: any;
  private buildRevenueChart() {
    const canvas = this.revenueChartCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.chartInstance) this.chartInstance.destroy();

    // 1. सभी यूनिक डेट्स निकालें और उन्हें सॉर्ट करें
    const dateSet = new Set<string>();
    this.outdoorOrders.forEach((o) => dateSet.add(this.toDate(o.date)));
    this.outdoorBills.forEach((b) => dateSet.add(this.toDate(b.date)));

    // तारीखों को कैलेंडर के हिसाब से सॉर्ट करें
    const sortedLabels = Array.from(dateSet).sort((a, b) => {
      return (
        new Date(a.split('-').reverse().join('-')).getTime() -
        new Date(b.split('-').reverse().join('-')).getTime()
      );
    });

    // 2. डेटा को तारीख के हिसाब से मैप करें
    const orderValues = sortedLabels.map((label) => {
      return this.outdoorOrders
        .filter((o) => this.toDate(o.date) === label)
        .reduce((sum, o) => sum + Number(o.grandTotal || 0), 0);
    });

    const billValues = sortedLabels.map((label) => {
      return this.outdoorBills
        .filter((b) => this.toDate(b.date) === label)
        .reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);
    });

    // 3. चार्ट बनाएँ
    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sortedLabels,
        datasets: [
          {
            label: 'Total Orders (₹)',
            data: orderValues,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: '#3b82f6',
            borderWidth: 1,
            borderRadius: 5,
            barThickness: 25,
          },
          {
            label: 'Total Billed (₹)',
            data: billValues,
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: '#10b981',
            borderWidth: 1,
            borderRadius: 5,
            barThickness: 25,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { usePointStyle: true, padding: 20 },
          },
          tooltip: {
            backgroundColor: '#1e293b',
            padding: 12,
            callbacks: {
              label: (ctx) => ` ₹${ctx.parsed.y?.toLocaleString()}`,
            },
          },
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: { callback: (v) => '₹' + v },
          },
        },
      },
    });
  }

  private toDate(iso: string): string {
    if (!iso) return 'null';
    const d = new Date(iso);
    // समय को पूरी तरह नज़रअंदाज़ करें, सिर्फ तारीख की तुलना करें
    return `${d.getUTCDate()}-${d.getUTCMonth() + 1}-${d.getUTCFullYear()}`;
  }
}
