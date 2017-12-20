import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AlertService, AuthenticationService } from '../_services/index';
import {EmitterService} from '../_services/index';

@Component({
    moduleId: module.id,
    templateUrl: 'login.component.html'
})

export class LoginComponent implements OnInit {
    model: any = {};
    loading = false;
    returnUrl: string;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private alertService: AlertService,
        private emitterService: EmitterService) { }

    ngOnInit() {
        // reset login status
        this.authenticationService.logout();

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    SignIn() {
        this.loading = true;
        this.authenticationService.login(this.model.login, this.model.password)
            .subscribe(
                data => {
                    console.log('login', data);
                    this.router.navigate([this.returnUrl]);
                    this.emitterService.emitNavChangeEvent(data);
                },
                error => {
                    this.alertService.error('Вы неверно ввели логин или пароль');
                    this.loading = false;
                });
    }
}
