import { Routes, RouterModule } from '@angular/router';

import { HomeComponent, MainComponent } from './home/index';
import { BookComponent } from './book/index';
import { LoginComponent } from './login/index';
import { RegisterComponent } from './register/index';
import { AuthGuard } from './_guards/index';

const appRoutes: Routes = [
    { path: 'index', component: MainComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
	{ path: 'books', component: BookComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: 'index' },
];

export const routing = RouterModule.forRoot(appRoutes);