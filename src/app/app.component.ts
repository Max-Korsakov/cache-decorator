import { Component, OnInit } from '@angular/core';
import { InMemoryCache } from 'angular-caching/inmemory-cache';
import { of } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'caching';

  public result;
  public result2;
  public result3;

  public result4;
  public result5;
  public result6;

  public a;
  public b;
  public c;
  public d;

  public setData() {
    this.getSum(this.a, this.b).subscribe((result) => (this.result = result));
    this.getSum(this.a, this.b).subscribe((result) => (this.result2 = result));
    this.getSum(this.a, this.b).subscribe((result) => (this.result3 = result));
  }

  public setDataPrim() {
    this.result4 = this.getSumPrim(this.c, this.d);
    this.result5 = this.getSumPrim(this.c, this.d);
    this.result5 = this.getSumPrim(this.c, this.d);
  }

  @InMemoryCache({sync: false})
  private getSum(a: number, b: number) {
    return of(Number(a) + Number(b));
  }

  @InMemoryCache({ ttl: 3000, cacheSize: 2 })
  private getSumPrim(a: number, b: number) {
    return Number(a) + Number(b);
  }
}
