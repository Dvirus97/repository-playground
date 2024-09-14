import { Injectable, InjectionToken, signal } from '@angular/core';

@Injectable()
export class TestService {
  name = 'test service name dvir';
}

export const DATA = new InjectionToken<any>('DATA', {
  factory: () => {
    return { name: 'dvir berta', data: 'this is data' };
  },
});
