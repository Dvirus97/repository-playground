import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { DATA } from '../../Util/INjectorTest';

@Component({
  selector: 'app-comp1',
  standalone: true,
  imports: [CommonModule],
  // providers: [{ provide: DATA, useValue: { age: 12 } }],
  templateUrl: './comp1.component.html',
  styleUrl: './comp1.component.scss',
})
export class Comp1Component {
  name = input<string>('placeholder');
  data = inject(DATA);

  constructor() {
    // console.log(this.data);
  }
}
