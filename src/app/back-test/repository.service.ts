import { HttpClient } from '@angular/common/http';
import {
  inject,
  Injectable,
  InjectionToken,
  Signal,
  signal,
} from '@angular/core';
import { EMPTY, Observable, Subject, Subscription, switchMap, tap } from 'rxjs';
import { TypeNotRegisteredError } from '../../Util/TypeNotRegisterError';
import { smartPolling } from '../../Util/smartPolling';
import { isDataChanged } from '../../Util/compareObjects';

export type IBaseModel = {
  id: string;
  type: string;
  version?: number;
};

const BASE_URL = new InjectionToken('BASE_URL', {
  factory: () => 'http://localhost:5010',
});

class RepositoryService<T extends IBaseModel> {
  constructor(private http: HttpClient, private url: string) {}

  data$ = new Subject<T[]>();
  data = signal<T[]>([]);
  private setData(data: T[]) {
    this.data$.next(data);
    this.data.set(data);
  }
  updateDataOnChange = false;

  polling = smartPolling(() => this.getAll({ updateOnChange: true }), 1000, 5);
  // pollingSubscription: Subscription | undefined;

  getAll(options?: { updateOnChange: boolean }) {
    return this.http.get<T[]>(this.url).pipe(
      tap((x) => {
        if (
          (this.updateDataOnChange || options?.updateOnChange) &&
          isDataChanged(this.data(), x)
        ) {
          this.setData(x);
        }
      })
    );
  }
  getOne(id: string) {
    return this.http.get<T>(this.url + '/' + id);
  }
  addOne(data: T, options?: {}) {
    return this.http.post(this.url, data).pipe(
      switchMap((x) => {
        if (this.updateDataOnChange) {
          return this.getAll();
        }
        return EMPTY;
      })
    );
  }
  updateOne(data: T, options?: {}) {
    return this.http.put(this.url + '/' + data.id, data).pipe(
      switchMap((x) => {
        if (this.updateDataOnChange) {
          return this.getAll();
        }
        return EMPTY;
      })
    );
  }
  updateMany(data: T[], options?: {}) {
    return this.http.put(this.url, data).pipe(
      switchMap((x) => {
        if (this.updateDataOnChange) {
          return this.getAll();
        }
        return EMPTY;
      })
    );
  }
  deleteOne(id: string | number, options?: {}) {
    return this.http.delete(this.url + '/' + id).pipe(
      switchMap((x) => {
        if (this.updateDataOnChange) {
          return this.getAll();
        }
        return EMPTY;
      })
    );
  }
  deleteAll(options?: {}) {
    return this.http.delete(this.url).pipe(
      switchMap((x) => {
        if (this.updateDataOnChange) {
          return this.getAll();
        }
        return EMPTY;
      })
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class ClientService<T extends IBaseModel = IBaseModel> {
  private map = new Map<string, RepositoryService<T>>();
  private http = inject(HttpClient);
  private baseUrl = inject(BASE_URL);

  private getRepo(data: { type: string }) {
    const repo = this.map.get(data.type);
    if (!repo) {
      throw new TypeNotRegisteredError(data.type);
    }
    return repo;
  }
  private tryGetRepo(data: { type: string }) {
    return this.map.get(data.type);
  }

  register(
    types: string | string[],
    options?: { updateDataOnChange?: boolean }
  ) {
    (typeof types == 'string' ? [types] : types).forEach((type) => {
      if (this.map.has(type)) {
        return;
      }
      const repo = new RepositoryService<T>(
        this.http,
        this.baseUrl + '/' + type
      );
      repo.updateDataOnChange = options?.updateDataOnChange ?? false;
      this.map.set(type, repo);
      repo.getAll().subscribe();
    });
  }

  private pollingSubscriptionMap = new Map<string, Subscription>();
  private saveSubscription(type: string, repo: RepositoryService<T>) {
    if (this.pollingSubscriptionMap.has(type)) return;
    const subscription = repo.polling.observable.subscribe();
    this.pollingSubscriptionMap.set(type, subscription);
  }
  private removeSubscription(type: string) {
    if (this.pollingSubscriptionMap.has(type)) {
      this.pollingSubscriptionMap.get(type)?.unsubscribe();
      this.pollingSubscriptionMap.delete(type);
    }
  }
  polling = {
    start: (type?: string) => {
      if (type) {
        this.saveSubscription(type, this.getRepo({ type }));
      } else {
        [...this.map.entries()].forEach(([type, repo]) => {
          this.saveSubscription(type, repo);
        });
      }
    },
    stop: (type?: string) => {
      if (type) {
        this.removeSubscription(type);
      } else {
        [...this.map.entries()].forEach(([type, repo]) => {
          this.removeSubscription(type);
        });
      }
    },
  };

  select<K extends T = T>(type: string): Signal<K[]> {
    return this.getRepo({ type }).data.asReadonly() as Signal<K[]>;
  }
  select$<K extends T = T>(type: string): Observable<K[]> {
    return this.getRepo({ type }).data$.asObservable() as Observable<K[]>;
  }

  createEntity(data: T, onSuccess?: (x: any) => void) {
    this.addOne(data).subscribe(onSuccess);
  }
  updateEntity(data: T | T[], onSuccess?: (x: any) => void) {
    if (Array.isArray(data) && data.length > 0) {
      this.updateMany(data[0].type, data).subscribe(onSuccess);
    } else {
      this.updateOne(data as T).subscribe(onSuccess);
    }
  }
  deleteEntity(data: T, onSuccess?: (x: any) => void) {
    this.deleteOne(data).subscribe(onSuccess);
  }

  getOne(data: T) {
    return this.getRepo(data).getOne(data.id);
  }
  getAll(type: string) {
    return this.getRepo({ type }).getAll();
  }
  addOne(data: T, options?: {}) {
    return this.getRepo(data).addOne(data, options);
  }
  updateOne(data: T, options?: {}) {
    return this.getRepo(data).updateOne(data, options);
  }
  updateMany(type: string, data: T[], options?: {}) {
    return this.getRepo({ type }).updateMany(data, options);
  }
  deleteOne(data: T, options?: {}) {
    return this.getRepo(data).deleteOne(data.id, options);
  }
  deleteAll(type: string, options?: {}) {
    return this.getRepo({ type }).deleteAll(options);
  }

  customAction(
    type: string,
    action: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    config?: { data?: any; params?: string[] }
  ) {
    let _action = action ? action + '/' : '';
    let url = this.baseUrl + '/' + type + '/' + _action;
    if (config?.params) {
      url += config.params.join('/');
    }
    switch (method) {
      case 'GET':
        return this.http.get(url);
      case 'POST':
        return this.http.post(url, config?.data);
      case 'PUT':
        return this.http.put(url, config?.data);
      case 'DELETE':
        return this.http.delete(url, config?.data);
      default:
        throw new Error('Unknown method');
    }
  }
}
