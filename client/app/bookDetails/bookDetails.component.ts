import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookDetails } from '../_models/index';
import { BookService, AlertService } from '../_services/index';
import { SendDataService } from '../_services/data.service';

declare var autosize: any;

@Component({
    moduleId: module.id,
    templateUrl: './bookDetails.component.html',
    styleUrls: ['./bookDetails.component.css']
})

export class BookDetailsComponent implements OnInit, AfterViewInit{
    bookDetails: BookDetails;
    receivedData: any;

    constructor(
        private bookService: BookService,
        private route: ActivatedRoute,
        private _SendDataService: SendDataService, 
        private alertService: AlertService) {
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
            this.receivedData.thumbnail, 
            this.receivedData.EstimatedRating, 
            this.receivedData.RatingCount,
            0
        );

        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        /*получение статуса книги */
        this.bookService.getBookInfo(this.receivedData.title, this.receivedData.authors, currentUser.UserId)
            .subscribe(
                data => {
                    console.log('statusIs: ', data);
                    if (data.length != 0)
                    {
                        this.bookDetails._id = data[0].BookId;
                        this.bookDetails.status = data[0].Status;
                        this.bookDetails.estimatedRating = data[0].EstimatedRating;
                        this.bookDetails.userRating = data[0].UserRating;
                        this.bookDetails.ratingCount = data[0].RatingCount;

                        this.changeRateImage(this.bookDetails.userRating, 0, "user-rate");
                    }
                },
                error => {
                    this.alertService.error(error);
                });
        
        this.changeRateImage(this.bookDetails.userRating, 0, "user-rate");
        this.changeRateImage(this.bookDetails.estimatedRating/(this.bookDetails.ratingCount===0?1:this.bookDetails.ratingCount), 0, "avg-rate");
    }

    ngAfterViewInit() {
        var textareas = document.querySelectorAll('textarea');
        autosize(textareas);
    }

    AddBook(book:BookDetails, status: string)
    {
        book.status = status;
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.bookService.AddInFavourite(book, currentUser)
            .subscribe(
                data => {
                    this.alertService.success('Книга успешно добавлена в избранное со статусом «' + status + '»', true);
                },
                error => {
                    this.alertService.error(error);
                });
    }

    
    changeUserRateImage(id : string){
        this.changeRateImage(Number(id), this.bookDetails.userRating, "user-rate");
    }

    changeRateImage(newRate : number, oldRate : number, rateClassName : string){
        newRate = Math.round(newRate);
        oldRate = Math.round(oldRate);
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
         var newSumRate;
         var newRatingCount;
         if(this.bookDetails.userRating === Number(rateValue)) {
            newSumRate = this.bookDetails.estimatedRating - this.bookDetails.userRating;
            newRatingCount = this.bookDetails.ratingCount - 1;
            this.bookDetails.userRating = 0;
         }
         else {
            newSumRate = this.bookDetails.estimatedRating - this.bookDetails.userRating + Number(rateValue);
            if(this.bookDetails.userRating === 0) {
                newRatingCount = this.bookDetails.ratingCount + 1;
                /*тут оценка выставляется впервые. нужно добавлять книгу в избранное со статусом "Прочитано"*/
                this.AddBook(this.bookDetails, 'Прочитана');
            }
            else {
                newRatingCount = this.bookDetails.ratingCount;
            }
            this.bookDetails.userRating = Number(rateValue);
         }
         this.changeRateImage(this.bookDetails.userRating, this.bookDetails.userRating, "user-rate");
                  
         this.changeRateImage(newSumRate / (newRatingCount===0?1:newRatingCount), 
                              this.bookDetails.estimatedRating / (this.bookDetails.ratingCount===0?1:this.bookDetails.ratingCount),
                               "avg-rate");
         this.bookDetails.estimatedRating = newSumRate;
         this.bookDetails.ratingCount = newRatingCount;

         /* Вот теперь тут закидываем в базу оценку. Модель готова */
     }
}