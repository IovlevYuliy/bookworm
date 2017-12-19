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

        this.bookDetails.estimatedRating = 3;
        this.bookDetails.userRating = 2;
        this.changeRateImage(this.bookDetails.userRating, 0, "user-rate");
        this.changeRateImage(this.bookDetails.estimatedRating, 0, "avg-rate");
    }

    ngAfterViewInit() {
        var textareas = document.querySelectorAll('textarea');
        autosize(textareas);
    }

    AddBook(book:BookDetails, statusId: string)
    {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

    
    changeUserRateImage(id : string){
        this.changeRateImage(Number(id), this.bookDetails.userRating, "user-rate");
    }

    changeRateImage(newRate : number, oldRate : number, rateClassName : string){
        var arr = Array.from(document.getElementsByClassName(rateClassName));
        var rates;
        if(newRate > oldRate) {
            rates = arr.filter(v => Number(v.id) <= newRate && Number(v.id) > oldRate);
        } 
        else if(newRate < oldRate) {
            rates = arr.filter(v => Number(v.id) <=  oldRate && Number(v.id) > newRate);
        }
        else {
            return;
        }
        rates.forEach(element => {
            if(Number(element.id) <= (newRate > oldRate ? newRate : oldRate) ) {
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
       //  this.changeUserRateImage(String(this.bookDetails.userRating));
         this.changeRateImage(this.bookDetails.userRating, this.bookDetails.userRating, "user-rate");
         //и тут надо при выставлении оценки менять статус на "прочитано"
        
         
         var newAvgRate = this.bookDetails.estimatedRating - 1;/*тут еще происходит пересчет средней оценки книги */
         /* и отображение оценки меняется */
         this.changeRateImage(newAvgRate, this.bookDetails.estimatedRating, "avg-rate");
         this.bookDetails.estimatedRating = newAvgRate;
     }
}