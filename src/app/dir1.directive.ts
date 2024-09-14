import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appDir1]',
  standalone: true,
  exportAs: 'dir1',
})
export class Dir1Directive {
  el = inject(ElementRef);
  constructor() {}
  name = 'dvir';
}
