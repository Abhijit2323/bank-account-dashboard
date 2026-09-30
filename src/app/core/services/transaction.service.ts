import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Transaction } from '../../models/transaction.model';
import { Account } from '../../models/account.model';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {

    private http = inject(HttpClient);

    private transactionApiUrl =
        'http://localhost:3000/transactions';

    private accountApiUrl =
        'http://localhost:3000/accounts';


    // Get transactions for an account
    getTransactions(
        accountId: string
    ): Observable<Transaction[]> {

        return this.http.get<Transaction[]>(
            `${this.transactionApiUrl}?accountId=${accountId}`
        );

    }


    // Create a new transaction
    createTransaction(
        transaction: Transaction
    ): Observable<Transaction> {

        return this.http.post<Transaction>(
            this.transactionApiUrl,
            transaction
        );

    }


    // Update account balance
    updateAccountBalance(
        accountId: string,
        balance: number
    ): Observable<Account> {

        return this.http.patch<Account>(
            `${this.accountApiUrl}/${accountId}`,
            {
                balance: balance
            }
        );

    }

}