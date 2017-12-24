import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookDetails } from '../_models/index';
import { BookService, AlertService } from '../_services/index';
import { SendDataService } from '../_services/data.service';

declare var autosize: any;

@Component({
    moduleId: module.id,
    templateUrl: './bookEdit.component.html',
    styleUrls: ['./bookEdit.component.css']
})

export class BookEditComponent implements OnInit, OnDestroy,  AfterViewInit{
    bookDetails: BookDetails;
    id: string;
    private sub: any;
    
    constructor(private route: ActivatedRoute,
                private bookService: BookService, 
                private alertService: AlertService,
                private _SendDataService: SendDataService) {
        this.bookDetails = new BookDetails("", "", "", "", "", "", "", 0, 0, 0);
    }    

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
           this.id = params['id']; 
           this.bookService.getBookById(this.id)
            .subscribe(
                data => {
                    this.bookDetails = data;
                    // var textareas = document.querySelectorAll('textarea');
                    // autosize(textareas);
                },
                error => {
                    this.alertService.error(error);
                }); 
        });

    }

    ngAfterViewInit() {
        var textareas = document.querySelectorAll('textarea');
        autosize(textareas);
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
      }

    SaveChanges() {
        var fdgfd="";
        this.bookService.updateBookInfo(this.bookDetails)
            .subscribe(
                data => {
                    this.alertService.success('Информация о книге успешно обновлена', true);
                  //  this.bookDetails = data;
                },
                error => {
                    this.alertService.error(error);
                }); 
    }
}