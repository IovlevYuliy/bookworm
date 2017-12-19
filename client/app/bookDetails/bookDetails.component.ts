import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookDetails } from '../_models/index';
import { BookService } from '../_services/index';
import { SendDataService } from '../_services/data.service';


declare var autosize: any;

@Component({
    moduleId: module.id,
    templateUrl: './bookDetails.component.html',
    styleUrls: ['./bookDetails.component.css']
})

export class BookDetailsComponent implements OnInit, AfterViewInit{
    bookDetails: BookDetails;
    bookId: any;//какой у нас тип идентификаторов?
    receivedData: any;

    constructor(
        private bookService: BookService,
        private route: ActivatedRoute,
        private _SendDataService: SendDataService) {
        this.receivedData = this._SendDataService.getData();
        console.log('Details', this.receivedData);
    }

    ngOnInit() {       
        this.bookDetails = new BookDetails(
            '1',
            this.receivedData.title,
            this.receivedData.description,
            this.receivedData.publishedDate,
            this.receivedData.authors,
            this.receivedData.link,
            this.receivedData.thumbnail
        );
       // this.bookDetails.status = "Заброшена";

        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        /*получение статуса книги */

        /*получение оценок книги*/
        // this.bookService.getBookRates('700ab0cd-3ceb-4fad-b439-096f1916bd27',currentUser.UserId)
        //      .subscribe(
        //          data => {
        //             this.bookDetails.status = "44";
        //         },
        //        error => {
        //         this.bookDetails.status ="0";
        //        });

        this.bookDetails.estimatedRating = 4;
        this.bookDetails.userRating = 3;
        this.setBookRate("user-rate", this.bookDetails.userRating);
        this.setBookRate("avg-rate", this.bookDetails.estimatedRating);
    }

    ngAfterViewInit() {
        var textareas = document.querySelectorAll('textarea');
        autosize(textareas);
    }

    AddBook(book:BookDetails, statusId: string)
    {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

    setBookRate (_className : string, _rate : number){
        var arr = Array.from(document.getElementsByClassName(_className));
        var r = String(Math.round(_rate));        
        arr.forEach(element => {
            if(element.id <= r) {
                element.classList.toggle('star-full');               
            }
        });
    }

    changeUserRateImage(id : string){
        var arr = Array.from(document.getElementsByClassName("user-rate"));
        var rates;
        if(Number(id) > this.bookDetails.userRating) {
            rates = arr.filter(v => v.id <= id && Number(v.id) > this.bookDetails.userRating);
        } 
        else if(Number(id) < this.bookDetails.userRating) {
            rates = arr.filter(v => Number(v.id) <=  this.bookDetails.userRating && v.id > id);
        }
        else {
            return;
        }
        rates.forEach(element => {
            if(element.id <= (Number(id) > this.bookDetails.userRating ? id : this.bookDetails.userRating) ) {
                element.classList.toggle('star-full'); 
            }            
        });
    }

     AddRate(rateValue: string) {
         //если у пользователя уже стоит такая сохраненная оценка, надо сбросить оценку вообще.         
         if(this.bookDetails.userRating === Number(rateValue)) {
            this.bookDetails.userRating = 0;
         }
         else {
            this.bookDetails.userRating = Number(rateValue);
         }
         this.changeUserRateImage(String(this.bookDetails.userRating));
         
         //и тут надо при выставлении оценки менять статус на "прочитано"
     }
}