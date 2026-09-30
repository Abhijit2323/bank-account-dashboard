import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        loadComponent: () =>
            import('./features/dashboard/dashboard/dashboard')
                .then(m => m.Dashboard)
    },
    {
        path: 'accounts',
        loadComponent: () =>
            import('./features/accounts/account-list/account-list/account-list')
                .then(m => m.AccountList)
    },
    {
        path: 'accounts/add',
        loadComponent: () =>
            import('./features/accounts/account-form/account-form/account-form')
                .then(m => m.AccountForm)
    },
    {
        path: 'accounts/:id/edit',
        loadComponent: () =>
            import('./features/accounts/account-form/account-form/account-form')
                .then(m => m.AccountForm)
    },
    {
        path: 'accounts/:id',
        loadComponent: () =>
            import('./features/accounts/account-details/account-details/account-details')
                .then(m => m.AccountDetails)
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];