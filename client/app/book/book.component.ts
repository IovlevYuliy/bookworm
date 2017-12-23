import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Book } from '../_models/index';
import { BookService, AlertService } from '../_services/index';
import { SendDataService } from '../_services/data.service';


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
        private route: ActivatedRoute,
        private alertService: AlertService,
        private _SendDataService: SendDataService) {
        console.log(this._SendDataService.getData());
    }

    ngOnInit() {
        this.title = this.route.snapshot.queryParams.title;
        this.loadBooks();
    }

    AddBook(book:Book)
    {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.bookService.AddInFavourite(book, currentUser)
            .subscribe(
                data => {
                    this.alertService.success(data.text(), false);
                },
                error => {
                    this.alertService.error(error);
                });
    }

    private loadBooks() {
        this.bookService.getByName(this.title)
            .subscribe(books => { this.books = books; console.log(this.books); });
    }
}