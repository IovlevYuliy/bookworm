import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { HttpParams, HttpClient } from '@angular/common/http';

import { Book, User } from '../_models/index';

@Injectable()
export class BookService {
    constructor(private http: Http) { }

    getAll() {
       // return this.http.get('/users').map((response: Response) => response.json());
    }

    getByName(_name: string) {
        return this.http.get('/books?title=' + _name).map((response: Response) => response.json());
    }

    getCatalogBooks(){
        return this.http.get('/books/catalog').map((response: Response) => response.json());
    }

    getBookInfo(title: string, authors: string, userId: string){
        let params: URLSearchParams = new URLSearchParams();

        params.set('title', title);
        params.set('authors', authors);
        params.set('userId',  userId);

        let requestOptions = new RequestOptions();
        requestOptions.search = params;


        return this.http.get('/books/bookDetails', requestOptions).map((response: Response) => response.json());
    }

    AddInFavourite(book: Book, currentUser: User) {
        let favouriteBook = {
            book: book,
            user: currentUser
        }
    	return this.http.post('/books/favour', favouriteBook);
    }
   
    getBooksWithNewKeyWords(){
        return this.http.get('/books/moderator').map((response: Response) => response.json());
    }

}