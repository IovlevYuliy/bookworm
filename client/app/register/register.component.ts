import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AlertService, UserService } from '../_services/index';

@Component({
    moduleId: module.id,
    templateUrl: 'register.component.html'
})

export class RegisterComponent {
    model: any = {};
    loading = false;

    constructor(
        private router: Router,
        private userService: UserService,
        private alertService: AlertService) { }
    register() {
        this.loading = true;

        this.userService.create(this.model)
            .subscribe(
                data => {
                    console.log('ddddd', data);
                    if (data.isExist == false)
                    {
                        this.alertService.success('Регистрация прошла успешно', true);
                        this.router.navigate(['/login']);
                    }
                    else
                    {
                        this.alertService.success('Регистрация не пройдена. Пользователь с данным логином уже существует', true);
                        this.loading = false;
                    }
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }
}
