import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Book } from '../_models/index';
import { BookService, AlertService } from '../_services/index';
import { SendDataService } from '../_services/data.service';


@Component({
    moduleId: module.id,
    templateUrl: './catalog.component.html',
    styleUrls: ['./catalog.component.css']
})

export class CatalogComponent implements OnInit {
    books: Book[] = [];
    title: any;

    constructor(
        private bookService: BookService,
        private route: ActivatedRoute,
        private alertService: AlertService,
        private _SendDataService: SendDataService) {
    }

    ngOnInit() {
        this.loadBooks();
    }

    AddBook(book:Book)
    {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.bookService.AddInFavourite(book, currentUser)
            .subscribe(
                data => {
                    this.alertService.success('Книга успешно добавлена в избранное', true);
                },
                error => {
                    this.alertService.error(error);
                });
    }

    private loadBooks() {
        this.bookService.getCatalogBooks()
            .subscribe(books => { this.books = books; console.log(this.books); });
    }
}