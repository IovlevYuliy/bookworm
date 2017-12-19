import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

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

    AddInFavourite(book: Book, currentUser: User) {
        console.log(currentUser);
        let favouriteBook = {
            book: book,
            user: currentUser
        }
    	return this.http.post('/books/favour', favouriteBook);
    }
    
    getUserBookStatus(bookid: string, currentUser: User) {        
        return this.http.get('/books/bookstatus?bookid='+bookid+'&userid='+currentUser).map((response: Response) => response.json());;
    }

    getBookRates(bookid: string, userid:string){
        // return this.http.get("/books/bookrates?bookid='"+bookid+"'&userid='"+userid+"'").map((response: Response) => response.json());
        return this.http.get("/books/bookrates").map((response: Response) => response.json());
        
    }
}