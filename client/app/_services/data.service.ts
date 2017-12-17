import { Injectable } from '@angular/core';
import { Book } from '../_models/index';

@Injectable()
export class SendDataService {
  public sharedData:Book;

  constructor(){
  }

  setData (data: Book) {
  	console.log('servNastya', data);
    this.sharedData = data;
  }
  getData () {
    return this.sharedData;
  }
}