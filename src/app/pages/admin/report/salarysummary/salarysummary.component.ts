import { Component } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-salarysummary',
  imports: [],
  templateUrl: './salarysummary.component.html',
  styleUrl: './salarysummary.component.css',
})
export class SalarysummaryComponent {
  ngAfterViewInit() {
    new Chart('salaryChart', {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [
          {
            label: 'Salary Paid',
            data: [40000, 30000, 50000, 60000, 45000],
          },
        ],
      },
    });
  }
}
