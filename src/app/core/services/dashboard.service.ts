import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { AccountService } from './account.service';
import { Account } from '../../models/account.model';

export interface DashboardData {
    totalAccounts: number;
    activeAccounts: number;
    inactiveAccounts: number;
    totalBalance: number;
    accountTypeSummary: {
        type: string;
        count: number;
    }[];
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    private accountService = inject(AccountService);

    getDashboardData(): Observable<DashboardData> {
        return this.accountService.getAccounts().pipe(
            map((accounts: Account[]) => {

                const totalAccounts = accounts.length;

                const activeAccounts = accounts.filter(
                    account => account.status === 'Active'
                ).length;

                const inactiveAccounts = accounts.filter(
                    account => account.status === 'Inactive'
                ).length;

                const totalBalance = accounts.reduce(
                    (total, account) => total + account.balance,
                    0
                );

                const accountTypes = ['Savings', 'Current', 'Salary'];

                const accountTypeSummary = accountTypes.map(type => ({
                    type,
                    count: accounts.filter(
                        account => account.accountType === type
                    ).length
                }));

                return {
                    totalAccounts,
                    activeAccounts,
                    inactiveAccounts,
                    totalBalance,
                    accountTypeSummary
                };
            })
        );
    }
}