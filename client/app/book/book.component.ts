import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { Book } from '../_models/index';
import { BookService } from '../_services/index';

@Component({
    moduleId: module.id,
    templateUrl: './book.component.html',
    styleUrls: ['./book.component.css']
})

export class BookComponent implements OnInit {
    books: Book[] = [];
    title: any;

    constructor(
        private bookService: BookService,
        private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.title = this.route.snapshot.queryParams.title;
        this.loadBooks();
    }

    private loadBooks() {
        this.bookService.getByName(this.title)
            .subscribe(books => { this.books = books; console.log(this.books); });
    }
}