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
    avgRating: any;
    private sub: any;
    bookid:string;
    keyWords: string[] = [];
    @ViewChild('tags')
    private eltags : ElementRef;

    constructor(
        private bookService: BookService,
        private route: ActivatedRoute,
        private _SendDataService: SendDataService, 
        private alertService: AlertService) {
        this.receivedData = this._SendDataService.getData();
        console.log('Details', this.receivedData);
    }

    ngOnInit() {  
        // this.sub = this.route
        // .queryParams
        // .subscribe(params => {
        //   // Defaults to 0 if no query param provided.
        //   this.bookid = params['bookid'] || '1';
        // });


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
                        this.bookDetails.estimatedRating = data[0].EstimatedRating || 0;
                        this.bookDetails.userRating = data[0].UserRating || 0;
                        this.bookDetails.ratingCount = data[0].RatingCount || 0;

                        this.changeRateImage(this.bookDetails.userRating, 0, "user-rate");
                        this.changeRateImage(this.bookDetails.estimatedRating/(this.bookDetails.ratingCount===0?1:this.bookDetails.ratingCount), 0, "avg-rate");
                    
                        let self = this;
                        data.forEach(function(book)
                            {
                                if (book.Word != null)
                                    self.keyWords.push(book.Word);
                            }   
                        )
                    }
                    else
                    {
                        this.bookDetails.estimatedRating = 0;
                        this.bookDetails.userRating = 0;
                        this.bookDetails.ratingCount = 0;
                    }
                    this.avgRating = Math.round(this.bookDetails.estimatedRating / (this.bookDetails.ratingCount==0?1:this.bookDetails.ratingCount) * 100) / 100;
                },
                error => {
                    this.alertService.error(error);
                });
        
    }

    ngAfterViewInit() {
        var textareas = document.querySelectorAll('textarea');
        autosize(textareas);
        //var inputt = document.getElementsByClassName('ng2-tag-input-field ng-untouched ng-pristine ng-valid');
        // while(input.length > 0){
        // input[0].parentNode.removeChild(input[0]);
        // }



       // let removeInput = document.getElementsByClassName('ng2-tag-input-remove');
       // console.log('qqqqq', removeInput);
        // for (var i = removeInput.length; i--; ) {
        //    removeInput.item(i).remove();
        // }


        // var quest = angul.element(document.querySelector(".quest"));
        // var questHeader = quest.find('h3');
        // // удалим заголовок
        // questHeader.remove();
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
         console.log('old', rateValue,  this.bookDetails);         
         var newSumRate;
         var newRatingCount;
         if(Math.round(this.bookDetails.userRating) === Number(rateValue)) {
            newSumRate = this.bookDetails.estimatedRating - this.bookDetails.userRating;
            newRatingCount = this.bookDetails.ratingCount - 1;
            this.bookDetails.userRating = 0;
         }
         else {
            newSumRate = this.bookDetails.estimatedRating - Math.round(this.bookDetails.userRating) + Number(rateValue);
            if(Math.round(this.bookDetails.userRating) === 0) {
                newRatingCount = this.bookDetails.ratingCount + 1;
                this.bookDetails.status = 'Прочитана';
            }
            else {
                newRatingCount = this.bookDetails.ratingCount;
            }
            this.bookDetails.userRating = Number(rateValue);
         }
         this.changeRateImage(this.bookDetails.userRating, this.bookDetails.userRating, "user-rate");     
                  
         this.changeRateImage(newSumRate / (newRatingCount===0?1:newRatingCount), 
                              this.bookDetails.estimatedRating / (this.bookDetails.ratingCount === 0 ? 1 : this.bookDetails.ratingCount),
                               "avg-rate");
         this.bookDetails.estimatedRating = newSumRate;
         this.bookDetails.ratingCount = newRatingCount;

         /* Вот теперь тут закидываем в базу оценку. Модель готова */
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));

        console.log('ttttt', this.bookDetails);
        this.AddBook(this.bookDetails, this.bookDetails.status);
        this.avgRating = Math.round(this.bookDetails.estimatedRating / (this.bookDetails.ratingCount==0?1:this.bookDetails.ratingCount) * 100) / 100;
     }
}