import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor() { }
  private toastSubject = new BehaviorSubject<string | null>(null);
  toast$ = this.toastSubject.asObservable();

  show(message: string, duration = 3000) {
    this.toastSubject.next(message);
    setTimeout(() => this.toastSubject.next(null), duration);
}
}
