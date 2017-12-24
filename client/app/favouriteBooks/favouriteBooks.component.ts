import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Book } from '../_models/index';
import { BookService, AlertService } from '../_services/index';
import { SendDataService } from '../_services/data.service';

@Component({
    moduleId: module.id,
    templateUrl: './favouriteBooks.component.html',
    styleUrls: ['./favouriteBooks.component.css']
})

export class FavouriteBooksComponent implements OnInit, OnDestroy,  AfterViewInit{
    books: Book[] = [];
    statusId: string;
    statusName: string;

    private sub: any;
    
    constructor(private route: ActivatedRoute,
                private bookService: BookService, 
                private alertService: AlertService,
                private _SendDataService: SendDataService) {}    

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
        this.statusId = params['statusId'];
        this.bookService.getStatusNameById(this.statusId)
               .subscribe(data => { 
                   this.statusName = String(data);
                },
                error => {
                   this.alertService.error(error);
                });

        let currentUser = JSON.parse(localStorage.getItem('currentUser'));           
        this.bookService.getFavouriteBooksList(currentUser.UserId, this.statusId)
            .subscribe(books => { 
                this.books = books; console.log(this.books); 
            });
        });
    }
      

    ngAfterViewInit() {
       
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}