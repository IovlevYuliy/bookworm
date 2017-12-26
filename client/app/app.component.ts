import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './_services/index';
import { Router } from '@angular/router';
import { EmitterService } from './_services/index';
import { User } from './_models/index';

@Component({
    moduleId: module.id,
    selector: 'app',
    templateUrl: 'app.component.html'
})

export class AppComponent implements OnInit{
    
	book = {
        title: ""
    };
    subscription: any;
    currentUser: User;

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private emitterService:EmitterService) {}
    ngOnInit()
    {
    	this.currentUser = JSON.parse(localStorage.getItem('currentUser'));	
        this.subscription = this.emitterService.getNavChangeEmitter()
            .subscribe((user: any) => {
                console.log('user', user);
                this.currentUser = user;
            });
    }

    logout()
    {
    	this.authenticationService.logout();
    	this.router.navigate(['/']);
        this.currentUser = null;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}