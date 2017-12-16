import { Injectable } from '@angular/core';
import {EventEmitter} from '@angular/core';

@Injectable()
export class EmitterService {
  navchange: EventEmitter<any> = new EventEmitter();

  constructor() {}

  emitNavChangeEvent(data: any) {
    this.navchange.emit(data);
  }
 
  getNavChangeEmitter() {
    return this.navchange;
  }
}