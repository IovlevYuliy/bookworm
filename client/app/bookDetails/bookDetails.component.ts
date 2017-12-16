import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookDetails } from '../_models/index';
import { BookService } from '../_services/index';

declare var autosize: any;

@Component({
    moduleId: module.id,
    templateUrl: './bookDetails.component.html',
    styleUrls: ['./bookDetails.component.css']
})

export class BookDetailsComponent implements OnInit, AfterViewInit{
    bookDetails: BookDetails;
    bookId: any;//какой у нас тип идентификаторов?

    constructor(
        private bookService: BookService,
        private route: ActivatedRoute) {
    }

    ngOnInit() {       
        //this.bookId = this.route.snapshot.queryParams.bookId;
        //this.getBookByID()

        this.bookDetails = new BookDetails(
            '1',
            'Эффект Марко',
            'Его зовут Марко, и он – часть преступного клана, орудующего в Дании. Золя, главарь этого клана, заставляет подростков, таких как Марко, лазать по карманам и залезать в квартиры; парни же постарше берутся за дела посерьезнее, не гнушаясь и заказными убийствами. В клане царит железная дисциплина. Но Марко мечтает лишь об одном – сбежать куда-нибудь подальше и зажить нормальной жизнью обычного человека. И однажды он решается на побег. Но при этом случайно узнает тщательно скрываемую тайну о страшном убийстве, совершенном когда-то членами клана. Теперь его ждет неминуемая смерть. Спасти Марко может лишь Карл Мёрк, начальник отдела "Q" столичной полиции, ведущий расследование того давнего убийства.',            
            '2017',
            'Юсси Адлер-Ольсен'
        );
    }

    private getBookByID() {
     
    }

    ngAfterViewInit() {
        var textareas = document.querySelectorAll('textarea');
        autosize(textareas);
    }
}