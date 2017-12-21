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
   // books: BookDetails[] = [];
    books: any[];
    keyWordsBooks: object = {};
    tags = ['qq', 'abc'];
    constructor(
        private bookService: BookService,
        private route: ActivatedRoute) {
    }

    ngOnInit() {       
        this.loadBooksWithNewKeywords()
    }

    private unionKeyWords()
    {
        for (var i = this.books.length - 1; i >= 0; i--) {
            console.log('forr', this.books);
            let bookId = this.books[i].BookId[0];
            let keyWord = {
                wordId : this.books[i].KeyWordId[0],
                word: this.books[i].Word
            }
           
            if (!this.keyWordsBooks[bookId])
                this.keyWordsBooks[bookId] = [];

            this.keyWordsBooks[bookId].push(keyWord);
              console.log('forrsss', this.keyWordsBooks);
        }
    }

    private loadBooksWithNewKeywords() {
        this.bookService.getBooksWithNewKeyWords()
            .subscribe(books => { 
                this.books = books; 
                console.log(this.books);
                this.unionKeyWords();  
            });

    }


}