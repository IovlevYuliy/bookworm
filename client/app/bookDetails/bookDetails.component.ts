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
       console.log('getstatus');
        this.bookService.getBookStatus(this.receivedData.title, this.receivedData.authors)
            .subscribe(
                data => {
                    console.log('statusIs: ', data);
                    if (data.length != 0)
                        this.bookDetails.status = data[0].status;
                },
                error => {
                    this.alertService.error(error);
                });


        this.bookDetails = new BookDetails(
            '1',
            this.receivedData.title,
            this.receivedData.description,
            this.receivedData.publishedDate,
            this.receivedData.authors,
            this.receivedData.link,
            this.receivedData.thumbnail
        );
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
}