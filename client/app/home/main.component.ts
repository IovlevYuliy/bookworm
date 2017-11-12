import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { AlertService} from '../_services/index';
@Component({
    moduleId: module.id,
    templateUrl: 'mainUser.html'
})

export class MainComponent {
    book = {
        name: ""
    };

    constructor(
        private router: Router,
        private alertService: AlertService) { }

    search(): void {
        this.router.navigate(['/books'], { queryParams: { title: this.book.name }});
    }

    ngOnInit() {}
}
