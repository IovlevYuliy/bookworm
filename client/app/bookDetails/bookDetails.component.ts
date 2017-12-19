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
            this.receivedData.thumbnail
        );
       // this.bookDetails.status = "Заброшена";

        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        /*получение статуса книги */
        this.bookService.getBookInfo(this.receivedData.title, this.receivedData.authors, currentUser.UserId)
            .subscribe(
                data => {
                    console.log('statusIs: ', data);
                    if (data.length != 0)
                    {
                        this.bookDetails.status = data[0].status;
                        this.bookDetails.estimatedRating = data[0].EstimatedRating;
                        this.bookDetails.userRating = data[0].UserRating;
                        this.bookDetails.ratingCount = data[0].RatingCount;
                    }
                },
                error => {
                    this.alertService.error(error);
                });



        // this.bookDetails.estimatedRating = 3;
        // this.bookDetails.userRating = 2;
        this.changeRateImage(this.bookDetails.userRating, 0, "user-rate");
        this.changeRateImage(this.bookDetails.estimatedRating, 0, "avg-rate");
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