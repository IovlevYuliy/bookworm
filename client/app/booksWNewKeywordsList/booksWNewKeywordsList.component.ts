import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookDetails } from '../_models/index';
import { BookService } from '../_services/index';

declare var autosize: any;

@Component({
    moduleId: module.id,
    templateUrl: './booksWNewKeywordsList.component.html',
    styleUrls: ['./booksWNewKeywordsList.component.css']
})

export class BooksWNewKeywordsListComponent implements OnInit {
    books: BookDetails[] = [];
    constructor(
        private bookService: BookService,
        private route: ActivatedRoute) {
    }

    ngOnInit() {       
        this.loadBooksWithNewKeywords();
    }
    private loadBooksWithNewKeywords() {
      //  this.bookService.getByName(this.title)
    //        .subscribe(books => { this.books = books; console.log(this.books); });
    }

}