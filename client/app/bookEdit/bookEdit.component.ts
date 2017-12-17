import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookDetails } from '../_models/index';
import { BookService } from '../_services/index';

declare var autosize: any;

@Component({
    moduleId: module.id,
    templateUrl: './bookDetails.component.html',
    styleUrls: ['./bookDetails.component.css']
})

export class BookDetailsComponent implements OnInit, AfterViewInit{
    bookDetails: BookDetails;
    bookId: any;

    constructor(
        private bookService: BookService,
        private route: ActivatedRoute) {
    }

    ngOnInit() {       
        //this.bookId = this.route.snapshot.queryParams.bookId;
        //this.getBookByID()

           }
    private getBookByID() {
        
       }

    ngAfterViewInit() {
        var textareas = document.querySelectorAll('textarea');
        autosize(textareas);
    }
}