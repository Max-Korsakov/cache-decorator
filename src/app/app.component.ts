import { Component } from '@angular/core';
import { InMemoryCache } from './inmemory-cache';
import { of } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'caching';

  public result
  public result2
  public result3

  public a;
  public b;

  public setData(){
    this.getSum(this.a, this.b).subscribe(result => this.result = result)
    this.getSum(this.a, this.b).subscribe(result => this.result2 = result)
    this.getSum(this.a, this.b).subscribe(result => this.result3 = result)
  }

  @InMemoryCache()
  public getSum(a: number, b: number) {
    return of(Number(a) + Number(b));
  }

}
