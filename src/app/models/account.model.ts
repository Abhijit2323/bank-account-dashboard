export type AccountType = 'Savings' | 'Current' | 'Salary';

export type AccountStatus = 'Active' | 'Inactive';

export interface Account {
    id: string;
    accountNumber: string;
    customerName: string;
    accountType: AccountType;
    branch: string;
    ifscCode: string;
    balance: number;
    email: string;
    mobile: string;
    status: AccountStatus;
    createdDate: string;
}

export interface AccountRequest {
    accountNumber: string;
    customerName: string;
    accountType: AccountType;
    branch: string;
    ifscCode: string;
    balance: number;
    email: string;
    mobile: string;
    status: AccountStatus;
}