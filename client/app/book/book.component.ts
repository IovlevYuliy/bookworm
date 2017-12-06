import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Book } from '../_models/index';
import { BookService, AlertService } from '../_services/index';

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
        private alertService: AlertService) {
    }

    ngOnInit() {
        this.title = this.route.snapshot.queryParams.title;
        this.loadBooks();
    }

    AddBook(book:Book)
    {
        this.bookService.AddInFavourite(book)
            .subscribe(
                data => {
                    this.alertService.success('Книга успешно добавлена в избранное', true);
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