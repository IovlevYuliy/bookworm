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
    bookId: any;//какой у нас тип идентификаторов?
    receivedData: any;
    avgRating: any;

    constructor(
        private bookService: BookService,
        private route: ActivatedRoute,
        private _SendDataService: SendDataService, 
        private alertService: AlertService) {
        this.receivedData = this._SendDataService.getData();
        console.log('Details', this.receivedData);
    }

    ngOnInit() {       
        //здесь нужно еще получить статус книги, если есть.
        
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
                        this.bookDetails.status = data[0].status;
                        console.log('estrat', data[0].EstimatedRating);
                        this.bookDetails.estimatedRating = data[0].EstimatedRating;
                        this.bookDetails.userRating = data[0].UserRating;
                        this.bookDetails.ratingCount = data[0].RatingCount;

                        this.changeRateImage(this.bookDetails.userRating, 0, "user-rate");
                        this.changeRateImage(this.bookDetails.estimatedRating/(this.bookDetails.ratingCount===0?1:this.bookDetails.ratingCount), 0, "avg-rate");
                    }
                    else
                    {
                        this.bookDetails.estimatedRating = 0;
                        this.bookDetails.userRating = 0;
                        this.bookDetails.ratingCount = 0;
                    }
                },
                error => {
                    this.alertService.error(error);
                });
                this.avgRating = Math.round(this.bookDetails.estimatedRating / (this.bookDetails.ratingCount==0?1:this.bookDetails.ratingCount) * 100) / 100;
        //this.changeRateImage(this.bookDetails.userRating, 0, "user-rate");
        //this.changeRateImage(this.bookDetails.estimatedRating/(this.bookDetails.ratingCount===0?1:this.bookDetails.ratingCount), 0, "avg-rate");
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
                    console.log('addbookresult', data);
                    this.bookDetails.bookId = data.bookId;
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
        console.log('changeRateImage', newRate, oldRate, rateClassName);
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
        console.log('rates', rates);
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
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));

        this.AddBook(this.bookDetails, this.bookDetails.status);
        this.avgRating = Math.round(this.bookDetails.estimatedRating / (this.bookDetails.ratingCount==0?1:this.bookDetails.ratingCount) * 100) / 100;
     }
}