import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { User } from '../_models/index';

@Injectable()
export class UserService {
    constructor(private http: Http) { }

    getAll() {
        return this.http.get('/users').map((response: Response) => response.json());
    }

    getById(_id: string) {
        return this.http.get('/users/' + _id).map((response: Response) => response.json());
    }

    create(user: User) {
        return this.http.post('/users/register', user).map((response: Response) => response.json());
    }

    update(user: User) {
        return this.http.put('/users/' + user.UserId, user);
    }

    delete(_id: string) {
        return this.http.delete('/users/' + _id);
    }
}