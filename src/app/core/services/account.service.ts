import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
    Account,
    AccountRequest
} from '../../models/account.model';

@Injectable({
    providedIn: 'root'
})
export class AccountService {

    private http = inject(HttpClient);

    private apiUrl = 'http://localhost:3000/accounts';

    getAccounts(): Observable<Account[]> {
        return this.http.get<Account[]>(this.apiUrl);
    }

    getAccountById(id: string): Observable<Account> {
        return this.http.get<Account>(
            `${this.apiUrl}/${id}`
        );
    }

    createAccount(
        account: AccountRequest
    ): Observable<Account> {
        return this.http.post<Account>(
            this.apiUrl,
            {
                ...account,
                createdDate: new Date()
                    .toISOString()
                    .split('T')[0]
            }
        );
    }

    updateAccount(
        id: string,
        account: AccountRequest
    ): Observable<Account> {
        return this.http.patch<Account>(
            `${this.apiUrl}/${id}`,
            account
        );
    }

    deleteAccount(
        id: string
    ): Observable<void> {
        return this.http.delete<void>(
            `${this.apiUrl}/${id}`
        );
    }
}