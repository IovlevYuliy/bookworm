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
                private alertService: AlertService) {}    

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
           this.id = params['id']; 
           /* достать книжку по айди */
        });
    }
      

    ngAfterViewInit() {
        var textareas = document.querySelectorAll('textarea');
        autosize(textareas);
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
      }
}