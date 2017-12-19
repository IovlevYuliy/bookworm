import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
// import { Autosize } from 'angular2-autosize';

import { AppComponent } from './app.component';
import { routing } from './app.routing';

import { customHttpProvider } from './_helpers/index';
import { AlertComponent } from './_directives/index';
import { AuthGuard } from './_guards/index';
import { AlertService, AuthenticationService, UserService, BookService, EmitterService} from './_services/index';
import { HomeComponent, MainComponent } from './home/index';
import { BookComponent } from './book/index';
import { LoginComponent } from './login/index';
import { RegisterComponent } from './register/index';
import { BookDetailsComponent } from './bookDetails/index';
import { SendDataService } from './_services/data.service';
import { CatalogComponent } from './catalog/index';
import { BooksWNewKeywordsListComponent } from './booksWNewKeywordsList/index';

import { TagInputModule } from 'ng2-tag-input';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        routing,
        TagInputModule
    ],
    declarations: [
        AppComponent,
        AlertComponent,
        HomeComponent,
        MainComponent,
        LoginComponent,
        RegisterComponent,
        BookComponent,
        BookDetailsComponent,
        CatalogComponent,
        BooksWNewKeywordsListComponent
    ],
    providers: [
        customHttpProvider,
        AuthGuard,
        AlertService,
        AuthenticationService,
        UserService,
        BookService,
        EmitterService,
        SendDataService
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }