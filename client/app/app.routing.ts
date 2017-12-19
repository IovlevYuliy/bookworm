import { Routes, RouterModule } from '@angular/router';

import { HomeComponent, MainComponent } from './home/index';
import { BookComponent } from './book/index';
import { LoginComponent } from './login/index';
import { RegisterComponent } from './register/index';
import { AuthGuard } from './_guards/index';
import { BookDetailsComponent } from './bookDetails/index';
import { CatalogComponent } from './catalog/index';
import { BooksWNewKeywordsListComponent } from './booksWNewKeywordsList/index';


const appRoutes: Routes = [
    { path: 'index', component: MainComponent },
    { path: 'login', component: LoginComponent },
    { path: 'logout', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
	{ path: 'books', component: BookComponent },
    { path: 'bookDetails', component: BookDetailsComponent },
    { path: 'books/catalog', component: CatalogComponent },
    { path: 'books/moderator', component:  BooksWNewKeywordsListComponent},
    // otherwise redirect to home
    { path: '**', redirectTo: 'index' },
];

export const routing = RouterModule.forRoot(appRoutes);