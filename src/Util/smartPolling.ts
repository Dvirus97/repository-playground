import {
  catchError,
  debounceTime,
  EMPTY,
  interval,
  map,
  Observable,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';

// export function smartPolling<R>(
//   pollFn: () => Observable<R>,
//   _interval: number = 5000,
//   maxRetries: number = 0
// ) {
//   const stopSubject = new Subject<void>();
//   const observable = new Observable<R>((observer) => {
//     let retries = 0;
//     const sharedPolling = interval(_interval).pipe(
//       startWith(0),
//       takeUntil(stopSubject),
//       switchMap(() =>
//         pollFn().pipe(
//           tap((newValue) => {
//             retries = 0;
//             console.log('tap');
//             observer.next(newValue);
//           }),
//           catchError((error) => {
//             if (++retries > maxRetries) {
//               observer.error(error);
//               return EMPTY;
//             }
//             console.warn(`Polling error (attempt ${retries}):`, error);
//             return EMPTY;
//           })
//         )
//       ),
//       shareReplay(1)
//     );

//     const subscription = sharedPolling.subscribe();

//     return () => {
//       subscription.unsubscribe();
//       // stopSubject.next();
//     };
//   });

//   return { observable };
// }

export function smartPolling<R>(
  pollFn: () => Observable<R>,
  _interval: number = 5000,
  maxRetries: number = 0
) {
  const stopSubject = new Subject<void>();
  let subscriberCount = 0;

  const sharedPolling = new Observable<R>((observer) => {
    subscriberCount++;
    let retries = 0;

    const subscription = interval(_interval)
      .pipe(
        startWith(0),
        takeUntil(stopSubject),
        switchMap(() =>
          pollFn().pipe(
            tap((newValue) => {
              retries = 0;
              console.log('tap');
              observer.next(newValue);
            }),
            catchError((error) => {
              if (++retries > maxRetries) {
                observer.error(error);
                return EMPTY;
              }
              console.warn(`Polling error (attempt ${retries}):`, error);
              return EMPTY;
            })
          )
        )
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      subscriberCount--;
      if (subscriberCount === 0) {
        stopSubject.next();
      }
    };
  }).pipe(shareReplay(1));

  return { observable: sharedPolling };
}

const a = new Observable((observer) => {
  observer.next('value');
  observer.complete();
});

const b = smartPolling(() => a, 5000).observable;
const c = b.subscribe((x) => console.log('1', x));
setTimeout(() => {
  const c = b.subscribe((x) => console.log('2', x));
  setTimeout(() => {
    c.unsubscribe();
  }, 7000);
}, 7000);

setTimeout(() => {
  c.unsubscribe();
}, 15000);

setTimeout(() => {
  b.subscribe((x) => console.log('3', x));
}, 20000);

// const a = interval(1000).pipe(tap((x) => console.log(x)));

// const b = a.subscribe();

// setTimeout(() => {
//   b.unsubscribe();
// }, 4000);
