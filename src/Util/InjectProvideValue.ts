import { InjectionToken, Injector } from '@angular/core';

export function injectProvideValue<T>(
  injectionToken: InjectionToken<T>,
  value: T | ((...args: unknown[]) => T)
) {
  if (value instanceof Function) {
    return Injector.create({
      providers: [{ provide: injectionToken, useFactory: value }],
    });
  }
  return Injector.create({
    providers: [{ provide: injectionToken, useValue: value }],
  });
}
