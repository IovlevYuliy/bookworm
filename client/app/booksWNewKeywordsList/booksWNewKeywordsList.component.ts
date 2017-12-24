import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookDetails } from '../_models/index';
import { BookService } from '../_services/index';
import {RlTagInputModule} from 'angular2-tag-input';


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
    public arrayOfKeys;
    wordToWordId: object = {};
    removedWords: object = {};
    addedWords: object = {};
    loading = false;

    constructor(
        private bookService: BookService,
        private route: ActivatedRoute,
        private tagModule: RlTagInputModule) {
    }

    ngOnInit() {       
        this.loadBooksWithNewKeywords();
    }

    private unionKeyWords()
    {
        for (var i = this.books.length - 1; i >= 0; i--) {
            console.log('forr', this.books);
            let bookId = this.books[i].BookId[0];

            let bookInfo = {
                bookId: this.books[i].BookId[0],
                title: this.books[i].title,
                authors: this.books[i].authors,
                thumbnail: this.books[i].thumbnail
            }
            let wordId = this.books[i].KeyWordId[0];
            let word = this.books[i].Word;
           
            if (!this.keyWordsBooks[bookId])
            {
                this.keyWordsBooks[bookId] = [];
                this.keyWordsBooks[bookId].push(bookInfo);
            }
          
            if (!this.keyWordsBooks[bookId][1])
                this.keyWordsBooks[bookId].push([]);
            this.keyWordsBooks[bookId][1].push(word);

            if (!this.wordToWordId[bookId])
                 this.wordToWordId[bookId] = [];
            if (!this.wordToWordId[bookId][word])
                 this.wordToWordId[bookId][word] = {};
            this.wordToWordId[bookId][word] = wordId;

            console.log('forrsss', this.keyWordsBooks);
            console.log('MAP', this.wordToWordId);
        }
        this.arrayOfKeys = Object.keys(this.keyWordsBooks);
    }

    private loadBooksWithNewKeywords() {
        this.bookService.getBooksWithNewKeyWords()
            .subscribe(books => { 
                this.books = books; 
                console.log(this.books);
                this.unionKeyWords();  
            });
    }

    AddTag(event, bookId)
    {
        if (!this.addedWords[bookId])
            this.addedWords[bookId] = [];

        if (!this.wordToWordId[bookId])
            this.wordToWordId[bookId] = [];
        // this.wordToWordId[bookId][event] = {};
        // this.wordToWordId[bookId][event] = 0;
        this.addedWords[bookId].push(event);
        console.log('AddTAG', this.addedWords);
    }

    RemoveTag(event, bookId)
    {
        if (!this.removedWords[bookId])
            this.removedWords[bookId] = [];

        if (this.wordToWordId[bookId])
            if (this.wordToWordId[bookId][event])
                this.removedWords[bookId].push(this.wordToWordId[bookId][event]);
        console.log('RemoveTAG', this.removedWords);
    }

    UpdateKeyWords()
    {
        this.loading = true;
        this.bookService.updateTags(this.removedWords, this.addedWords)
            .subscribe(
                data => {
                    this.loading = false;
                },
                error => {
                    this.loading = false;
                });
    }
}