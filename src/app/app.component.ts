import { Overlay } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, inject, Injector } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { RouterOutlet } from '@angular/router';

import { Observable } from 'rxjs';
import { DATA, TestService } from '../Util/INjectorTest';
import { Comp1Component } from './comp1/comp1.component';
import { Dir1Directive } from './dir1.directive';
import { TranslatePipe } from './translate.pipe';
import { COMP_UTIL } from '../Util/ComponentUtil';
import { ComponentPortal } from '@angular/cdk/portal';
import { injectProvideValue } from '../Util/InjectProvideValue';
import { BackTestComponent } from './back-test/back-test.component';
import { ClientService } from './back-test/repository.service';

const data = [
  //
  MatMenuModule,
  Dir1Directive,
  TranslatePipe,
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    data,
    Comp1Component,
    BackTestComponent,
  ],
  providers: [{ provide: TestService }],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  overlay = inject(Overlay);
  injector = inject(Injector);
  testService = inject(TestService);
  UTIL = COMP_UTIL;

  data = Array.from({ length: 3 });
  comp1 = Comp1Component;
  injectors = this.data.map((_, i) => {
    return Injector.create({
      providers: [
        {
          provide: DATA,
          useValue: { name: this.testService.name + i, index: i },
          // useFactory: () => {
          //   return this.testService.name + i;
          // },
        },
      ],
    });
  });

  clientService = inject(ClientService);
  constructor() {
    this.clientService.register(['person', 'car', 'dvir'], {
      updateDataOnChange: true,
    });
    // const overlay = this.overlay.create({
    //   backdropClass: 'my-backdrop',
    //   hasBackdrop: false,
    //   panelClass: 'my-overlay-1',
    // });
    // overlay.attach(
    //   new ComponentPortal(
    //     Comp1Component,
    //     null,
    //     injectProvideValue(DATA, () => {
    //       return {
    //         name: 'overlay ' + this.testService.name,
    //         data: 'overlay data',
    //       };
    //     })
    //   )
    // );
  }
}

/**
 *
 * @param time
 * @param intervals if not provided: 1 time
 * @returns
 */
function myTimer(time: number, intervals?: number) {
  let count = 0;
  return new Observable<number>((sub) => {
    function inner() {
      new Promise((resolve: (val: number) => void) => {
        setTimeout(() => {
          resolve(count++);
          console.log('resolved');
        }, time);
      }).then((val) => {
        sub.next(val);
        console.log('next');
        if (intervals && count < intervals) {
          inner();
        } else {
          sub.complete();
        }
      });
    }

    console.log('inner');
    inner();
  });
}
