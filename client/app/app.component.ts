import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './_services/index';
import { Router } from '@angular/router';

@Component({
    moduleId: module.id,
    selector: 'app',
    templateUrl: 'app.component.html'
})

export class AppComponent implements OnInit{
	 book = {
        name: ""
    };
   	constructor(
   		  private router: Router,
   		  private authenticationService: AuthenticationService) {}
    currentUser: any;
    ngOnInit()
    {
    	this.currentUser = JSON.parse(localStorage.getItem('currentUser'));	
    }

    logout()
    {
    	this.authenticationService.logout();
    	this.router.navigate(['/']);
    }
}