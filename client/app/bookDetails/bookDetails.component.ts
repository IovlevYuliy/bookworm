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
        //  this.bookService.getUserBookStatus(this.bookDetails._id, currentUser.UserId)
        //      .subscribe(
        //          data => {
        //             this.bookDetails.status = "44";//присвоить тут ответ от сервера по идее
        //         },
        //        error => {
        //            //this.alertService.error(error);
        //        });
    }

    ngAfterViewInit() {
        var textareas = document.querySelectorAll('textarea');
        autosize(textareas);
    }

    AddBook(book:BookDetails, statusId: string)
    {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        // this.bookService.AddInFavourite(book, currentUser)
        //     .subscribe(
        //         data => {
        //             this.alertService.success('Книга успешно добавлена в избранное', true);
        //         },
        //         error => {
        //             this.alertService.error(error);
        //         });
    }

    changeUserRateImage(id : string){
        var arr = Array.from(document.getElementsByClassName("user-rate"));
        var rates = arr.filter(v => v.id <= id);
        rates.forEach(element => {
            element.classList.toggle('star-full'); 
        });
    }

    mouseEnter(id : string){
        this.changeUserRateImage(id);
     }

     mouseLeave(id : string){
        this.changeUserRateImage(id);
        //возвращать надо не к пустоте, а к выставленной оценке
     }

     AddRate(rateValue: string) {
         // rateValue - оценка пользователя
         //возможно, тут стоит сделать проверку - если у пользователя уже стоит такая сохраненная оценка, надо сбросить оценку вообще.
         //на одном из сайтов именно так и работает.
         //и тут надо при выставлении оценки менять статус на "прочитано"
     }
}