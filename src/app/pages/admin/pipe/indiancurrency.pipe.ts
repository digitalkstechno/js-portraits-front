import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'indiancurrency',
})
export class IndiancurrencyPipe implements PipeTransform {
  transform(value: number | string, showSymbol: boolean = true): string {
    if (value === null || value === undefined) return '';

    const amount = typeof value === 'string' ? parseFloat(value) : value;

    // Built-in Intl.NumberFormat use karein jo Indian format (2,00,000) handle karta hai
    const formatter = new Intl.NumberFormat('en-IN', {
      style: showSymbol ? 'currency' : 'decimal',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatter.format(amount);
  }
}
